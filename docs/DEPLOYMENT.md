# ZonaVIP Platform - Deployment Guide

## Overview

This guide covers the complete deployment process for the ZonaVIP platform using Kubernetes, Terraform, and CI/CD automation.

**Target Environments**:
- Development (dev)
- Staging (staging)
- Production (prod)

**Cloud Provider**: AWS / Google Cloud Platform  
**Orchestration**: Kubernetes 1.28+  
**IaC Tool**: Terraform 1.6+  
**CI/CD**: GitHub Actions + ArgoCD

## Prerequisites

### Required Tools

```bash
# Kubernetes CLI
kubectl version --client

# Terraform
terraform -v

# Docker
docker version

# Helm (for package management)
helm version

# AWS CLI (if using AWS)
aws --version

# gcloud CLI (if using GCP)
gcloud version
```

### Required Access

- Cloud provider account with admin access
- Kubernetes cluster admin credentials
- Container registry access (GitHub Container Registry, Docker Hub, ECR, GCR)
- Domain name with DNS control
- SSL certificate (or Let's Encrypt)

## Infrastructure Setup with Terraform

### Directory Structure

```
infrastructure/
├── terraform/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── eks/           # AWS EKS
│   │   ├── gke/           # Google GKE
│   │   ├── rds/           # PostgreSQL
│   │   ├── redis/
│   │   └── storage/
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   ├── staging/
│   │   └── prod/
│   └── backend.tf
└── k8s/
    ├── base/
    ├── overlays/
    │   ├── dev/
    │   ├── staging/
    │   └── prod/
    └── README.md
```

### AWS Setup

#### 1. Configure AWS Provider

```hcl
# infrastructure/terraform/environments/prod/main.tf
terraform {
  required_version = ">= 1.6"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "zonavip-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "production"
      Project     = "ZonaVIP"
      ManagedBy   = "Terraform"
    }
  }
}
```

#### 2. VPC Configuration

```hcl
module "vpc" {
  source = "../../modules/vpc"
  
  vpc_name             = "zonavip-prod-vpc"
  vpc_cidr             = "10.0.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets      = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets       = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  database_subnets     = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]
  
  enable_nat_gateway   = true
  enable_dns_hostnames = true
  
  tags = {
    Environment = "production"
  }
}
```

#### 3. EKS Cluster

```hcl
module "eks" {
  source = "../../modules/eks"
  
  cluster_name    = "zonavip-prod"
  cluster_version = "1.28"
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  
  node_groups = {
    general = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 3
      instance_types   = ["t3.large"]
      disk_size        = 100
      
      labels = {
        role = "general"
      }
    }
    
    compute = {
      desired_capacity = 2
      max_capacity     = 5
      min_capacity     = 2
      instance_types   = ["c5.xlarge"]
      disk_size        = 100
      
      labels = {
        role = "compute"
      }
      
      taints = [{
        key    = "workload"
        value  = "compute"
        effect = "NoSchedule"
      }]
    }
  }
  
  tags = {
    Environment = "production"
  }
}
```

#### 4. RDS PostgreSQL with PostGIS

```hcl
module "rds_postgres" {
  source = "../../modules/rds"
  
  identifier = "zonavip-prod-db"
  
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.r6g.xlarge"
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_encrypted    = true
  
  database_name = "zonavip"
  username      = "zonavip_admin"
  password      = random_password.db_password.result
  port          = 5432
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  
  multi_az               = true
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "zonavip-prod-final-snapshot"
  
  # PostGIS extension will be enabled via init script
  parameters = [
    {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements,postgis"
    },
    {
      name  = "max_connections"
      value = "500"
    }
  ]
  
  tags = {
    Environment = "production"
  }
}
```

#### 5. ElastiCache Redis

```hcl
module "redis" {
  source = "../../modules/redis"
  
  cluster_id           = "zonavip-prod-redis"
  engine_version       = "7.0"
  node_type            = "cache.r6g.large"
  num_cache_nodes      = 3
  parameter_group_name = "default.redis7"
  
  subnet_group_name    = module.vpc.elasticache_subnet_group_name
  security_group_ids   = [aws_security_group.redis.id]
  
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  tags = {
    Environment = "production"
  }
}
```

#### 6. OpenSearch

```hcl
resource "aws_opensearch_domain" "zonavip" {
  domain_name    = "zonavip-prod"
  engine_version = "OpenSearch_2.11"
  
  cluster_config {
    instance_type          = "r6g.large.search"
    instance_count         = 3
    zone_awareness_enabled = true
    
    zone_awareness_config {
      availability_zone_count = 3
    }
  }
  
  ebs_options {
    ebs_enabled = true
    volume_size = 100
    volume_type = "gp3"
  }
  
  encrypt_at_rest {
    enabled = true
  }
  
  node_to_node_encryption {
    enabled = true
  }
  
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }
  
  vpc_options {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.opensearch.id]
  }
  
  tags = {
    Environment = "production"
  }
}
```

### Google Cloud Platform Setup

#### 1. GKE Cluster

```hcl
module "gke" {
  source = "../../modules/gke"
  
  project_id = var.gcp_project_id
  region     = var.gcp_region
  
  cluster_name = "zonavip-prod"
  
  network    = module.vpc.network_name
  subnetwork = module.vpc.subnetwork_name
  
  ip_range_pods     = "gke-pods"
  ip_range_services = "gke-services"
  
  node_pools = [
    {
      name               = "general-pool"
      machine_type       = "n2-standard-4"
      min_count          = 3
      max_count          = 10
      disk_size_gb       = 100
      auto_repair        = true
      auto_upgrade       = true
      preemptible        = false
    },
    {
      name               = "compute-pool"
      machine_type       = "c2-standard-4"
      min_count          = 2
      max_count          = 5
      disk_size_gb       = 100
      auto_repair        = true
      auto_upgrade       = true
      preemptible        = false
    }
  ]
}
```

#### 2. Cloud SQL PostgreSQL

```hcl
resource "google_sql_database_instance" "postgres" {
  name             = "zonavip-prod-db"
  database_version = "POSTGRES_15"
  region           = var.gcp_region
  
  settings {
    tier = "db-custom-4-16384"  # 4 vCPU, 16GB RAM
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
      }
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = module.vpc.network_id
    }
    
    database_flags {
      name  = "max_connections"
      value = "500"
    }
    
    database_flags {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements,postgis"
    }
  }
  
  deletion_protection = true
}
```

### Deploy Infrastructure

```bash
# Initialize Terraform
cd infrastructure/terraform/environments/prod
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Save outputs
terraform output -json > outputs.json
```

## Kubernetes Deployment

### Namespace Configuration

```yaml
# infrastructure/k8s/base/namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: zonavip-dev
  labels:
    environment: development
---
apiVersion: v1
kind: Namespace
metadata:
  name: zonavip-staging
  labels:
    environment: staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: zonavip-prod
  labels:
    environment: production
```

### ConfigMaps and Secrets

```yaml
# infrastructure/k8s/base/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: zonavip-config
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  API_VERSION: "v1"
  # Database config (non-sensitive)
  DB_HOST: "zonavip-prod-db.xxxxx.us-east-1.rds.amazonaws.com"
  DB_PORT: "5432"
  DB_NAME: "zonavip"
  # Redis config
  REDIS_HOST: "zonavip-prod-redis.xxxxx.cache.amazonaws.com"
  REDIS_PORT: "6379"
  # OpenSearch config
  OPENSEARCH_HOST: "search-zonavip-prod-xxxxx.us-east-1.es.amazonaws.com"
  OPENSEARCH_PORT: "443"
```

```yaml
# infrastructure/k8s/base/secrets.yaml
# Secrets should be managed via sealed-secrets or external secrets operator
apiVersion: v1
kind: Secret
metadata:
  name: zonavip-secrets
type: Opaque
data:
  # Base64 encoded values
  DB_PASSWORD: <base64-encoded>
  JWT_SECRET: <base64-encoded>
  JWT_REFRESH_SECRET: <base64-encoded>
  REDIS_PASSWORD: <base64-encoded>
  AWS_ACCESS_KEY_ID: <base64-encoded>
  AWS_SECRET_ACCESS_KEY: <base64-encoded>
```

### API Gateway Deployment

```yaml
# infrastructure/k8s/base/api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  labels:
    app: api-gateway
    tier: gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        tier: gateway
    spec:
      containers:
      - name: api-gateway
        image: ghcr.io/zonavip/api-gateway:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: zonavip-config
              key: NODE_ENV
        - name: PORT
          value: "3000"
        envFrom:
        - configMapRef:
            name: zonavip-config
        - secretRef:
            name: zonavip-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Auth Service Deployment

```yaml
# infrastructure/k8s/base/auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  labels:
    app: auth-service
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        tier: backend
    spec:
      containers:
      - name: auth-service
        image: ghcr.io/zonavip/auth-service:latest
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: PORT
          value: "3001"
        - name: SERVICE_NAME
          value: "auth-service"
        envFrom:
        - configMapRef:
            name: zonavip-config
        - secretRef:
            name: zonavip-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth-service
  ports:
  - port: 80
    targetPort: 3001
    protocol: TCP
  type: ClusterIP
```

### PostgreSQL StatefulSet

```yaml
# infrastructure/k8s/base/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgis/postgis:15-3.3
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: zonavip
        - name: POSTGRES_USER
          value: zonavip
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: zonavip-secrets
              key: DB_PASSWORD
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 50Gi
      storageClassName: gp3  # AWS EBS gp3
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

### Redis Deployment

```yaml
# infrastructure/k8s/base/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
          name: redis
        command:
        - redis-server
        - --appendonly
        - "yes"
        - --requirepass
        - $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: zonavip-secrets
              key: REDIS_PASSWORD
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
```

### Ingress Configuration

```yaml
# infrastructure/k8s/base/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zonavip-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.zonavip.com
    secretName: zonavip-tls
  rules:
  - host: api.zonavip.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
```

## CI/CD Pipeline

### GitHub Actions - CI

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
    
    - name: Run linter
      working-directory: ./backend
      run: npm run lint
    
    - name: Run tests
      working-directory: ./backend
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Run coverage
      working-directory: ./backend
      run: npm run test:cov
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./backend/coverage/lcov.info
  
  test-mobile:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: mobile/package-lock.json
    
    - name: Install dependencies
      working-directory: ./mobile
      run: npm ci
    
    - name: Run linter
      working-directory: ./mobile
      run: npm run lint
    
    - name: Run tests
      working-directory: ./mobile
      run: npm test
  
  test-web:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: web/package-lock.json
    
    - name: Install dependencies
      working-directory: ./web
      run: npm ci
    
    - name: Run linter
      working-directory: ./web
      run: npm run lint
    
    - name: Run tests
      working-directory: ./web
      run: npm test
    
    - name: Build
      working-directory: ./web
      run: npm run build
  
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Snyk Security Scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --all-projects --severity-threshold=high
```

### GitHub Actions - CD

```yaml
# .github/workflows/cd.yml
name: CD Pipeline

on:
  push:
    branches: [main]
    tags:
      - 'v*'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    strategy:
      matrix:
        service: [api-gateway, auth-service, catalog-service, convenios-service, transaction-service, notification-service, analytics-service]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        file: ./backend/Dockerfile.${{ matrix.service }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
  
  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name zonavip-staging --region us-east-1
    
    - name: Deploy to staging
      run: |
        kubectl set image deployment/api-gateway api-gateway=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api-gateway:${{ github.sha }} -n zonavip-staging
        kubectl rollout status deployment/api-gateway -n zonavip-staging
  
  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    environment:
      name: production
      url: https://api.zonavip.com
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name zonavip-prod --region us-east-1
    
    - name: Deploy to production
      run: |
        kubectl set image deployment/api-gateway api-gateway=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api-gateway:${GITHUB_REF#refs/tags/} -n zonavip-prod
        kubectl rollout status deployment/api-gateway -n zonavip-prod
```

## Deployment Commands

### Initial Cluster Setup

```bash
# Apply namespaces
kubectl apply -f infrastructure/k8s/base/namespaces.yaml

# Apply ConfigMaps and Secrets
kubectl apply -f infrastructure/k8s/base/configmap.yaml -n zonavip-prod
kubectl apply -f infrastructure/k8s/base/secrets.yaml -n zonavip-prod

# Deploy database
kubectl apply -f infrastructure/k8s/base/postgres-statefulset.yaml -n zonavip-prod

# Deploy Redis
kubectl apply -f infrastructure/k8s/base/redis-deployment.yaml -n zonavip-prod

# Deploy microservices
kubectl apply -f infrastructure/k8s/base/auth-service-deployment.yaml -n zonavip-prod
kubectl apply -f infrastructure/k8s/base/catalog-service-deployment.yaml -n zonavip-prod
# ... other services

# Deploy API Gateway
kubectl apply -f infrastructure/k8s/base/api-gateway-deployment.yaml -n zonavip-prod

# Apply Ingress
kubectl apply -f infrastructure/k8s/base/ingress.yaml -n zonavip-prod
```

### Monitoring Deployments

```bash
# Watch deployment status
kubectl get deployments -n zonavip-prod -w

# Check pod status
kubectl get pods -n zonavip-prod

# View logs
kubectl logs -f deployment/auth-service -n zonavip-prod

# Describe service
kubectl describe service api-gateway -n zonavip-prod
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment auth-service --replicas=5 -n zonavip-prod

# Check HPA status
kubectl get hpa -n zonavip-prod
```

### Rolling Updates

```bash
# Update image
kubectl set image deployment/auth-service auth-service=ghcr.io/zonavip/auth-service:v1.2.0 -n zonavip-prod

# Check rollout status
kubectl rollout status deployment/auth-service -n zonavip-prod

# Rollback if needed
kubectl rollout undo deployment/auth-service -n zonavip-prod
```

## Monitoring & Logging

### Prometheus & Grafana

```bash
# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

### ELK Stack

```bash
# Install ECK operator
kubectl create -f https://download.elastic.co/downloads/eck/2.10.0/crds.yaml
kubectl apply -f https://download.elastic.co/downloads/eck/2.10.0/operator.yaml

# Deploy Elasticsearch and Kibana
kubectl apply -f infrastructure/k8s/base/elk-stack.yaml -n logging
```

## Backup & Disaster Recovery

### Database Backup

```bash
# Manual backup
kubectl exec -n zonavip-prod postgres-0 -- pg_dump -U zonavip zonavip > backup-$(date +%Y%m%d).sql

# Restore from backup
kubectl exec -i -n zonavip-prod postgres-0 -- psql -U zonavip zonavip < backup-20240115.sql
```

### Automated Backups

Managed by AWS RDS or Google Cloud SQL automated backups (configured in Terraform).

## Troubleshooting

### Common Issues

**Pods not starting**:
```bash
kubectl describe pod <pod-name> -n zonavip-prod
kubectl logs <pod-name> -n zonavip-prod --previous
```

**Service not accessible**:
```bash
kubectl get endpoints <service-name> -n zonavip-prod
kubectl describe service <service-name> -n zonavip-prod
```

**Database connection issues**:
```bash
kubectl exec -it <pod-name> -n zonavip-prod -- sh
nc -zv postgres 5432
```

## Security Best Practices

1. **Use RBAC**: Define role-based access control for all users
2. **Network Policies**: Implement network policies to restrict pod-to-pod communication
3. **Pod Security**: Use Pod Security Standards (restricted profile)
4. **Secrets Management**: Use external secrets operator or sealed-secrets
5. **Image Scanning**: Scan all container images for vulnerabilities
6. **TLS**: Enforce TLS for all external and internal communication

## Performance Optimization

1. **Resource Limits**: Always set CPU and memory limits
2. **HPA**: Use Horizontal Pod Autoscaling for all stateless services
3. **PDB**: Configure Pod Disruption Budgets for high availability
4. **Affinity Rules**: Use pod anti-affinity for critical services
5. **Connection Pooling**: Use PgBouncer for database connections

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Architecture Documentation](./ARCHITECTURE.md)
