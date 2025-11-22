# ZonaVIP Infrastructure

Infrastructure as Code (IaC) for the ZonaVIP platform using Terraform and Kubernetes.

## Directory Structure

```
infrastructure/
├── terraform/          # Terraform configurations
│   ├── modules/       # Reusable Terraform modules
│   │   ├── vpc/
│   │   ├── eks/
│   │   ├── rds/
│   │   ├── redis/
│   │   └── opensearch/
│   └── environments/  # Environment-specific configs
│       ├── dev/
│       ├── staging/
│       └── prod/
└── k8s/               # Kubernetes manifests
    ├── base/          # Base configurations
    └── overlays/      # Environment-specific overlays
        ├── dev/
        ├── staging/
        └── prod/
```

## Prerequisites

- Terraform 1.6+
- kubectl
- AWS CLI (for AWS deployments)
- gcloud CLI (for GCP deployments)
- Helm 3+

## Quick Start

### Terraform

```bash
# Navigate to environment
cd terraform/environments/prod

# Initialize Terraform
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan
```

### Kubernetes

```bash
# Apply base configurations
kubectl apply -k k8s/overlays/prod

# Check deployment status
kubectl get pods -n zonavip-prod

# View logs
kubectl logs -f deployment/api-gateway -n zonavip-prod
```

## Documentation

For complete deployment instructions, see:
- [DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md)

## Environments

### Development
- **Purpose**: Local development and testing
- **Replicas**: 1-2 per service
- **Resources**: Minimal

### Staging
- **Purpose**: Pre-production testing
- **Replicas**: 2 per service
- **Resources**: Medium
- **URL**: https://staging.zonavip.com

### Production
- **Purpose**: Live production workloads
- **Replicas**: 3-5 per service
- **Resources**: High
- **URL**: https://api.zonavip.com

## Security

- All secrets managed via AWS Secrets Manager / GCP Secret Manager
- TLS certificates via cert-manager + Let's Encrypt
- Network policies for pod-to-pod communication
- RBAC for access control

## Monitoring

- Prometheus for metrics
- Grafana for visualization
- ELK stack for logging
- Jaeger for distributed tracing

## Support

See [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for detailed instructions.
