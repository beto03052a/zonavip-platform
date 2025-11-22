# ZonaVIP Platform - Database Schema

## Overview

This document describes the complete database schema for the ZonaVIP platform, including all entities, relationships, and PostGIS geospatial capabilities.

**Database**: PostgreSQL 15 with PostGIS 3.3 extension  
**Character Set**: UTF-8  
**Collation**: es_ES.UTF-8 (Spanish locale)

## Entity-Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Usuario      │         │    Entidad      │         │    Negocio      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ PK id           │         │ PK id           │         │ PK id           │
│    email        │         │    razon_social │         │    nombre       │
│    password_hash│         │    ruc          │         │    ruc          │
│    nombre       │    ┌───▶│    telefono     │◀───┐    │    categoria    │
│    apellido     │    │    │    email        │    │    │    direccion    │
│    telefono     │    │    │    direccion    │    │    │    telefono     │
│    rol          │    │    │    estado       │    │    │    email        │
│ FK entidad_id   │────┘    │    created_at   │    │    │ ⊕  latitud      │
│    estado       │         │    updated_at   │    │    │ ⊕  longitud     │
│    created_at   │         └─────────────────┘    │    │    estado       │
│    updated_at   │                 │              │    │    created_at   │
└────────┬────────┘                 │              │    │    updated_at   │
         │                          │              │    └────────┬────────┘
         │                          ▼              │             │
         │                ┌─────────────────┐     │             │
         │                │      Plan       │     │             │
         │                ├─────────────────┤     │             │
         │                │ PK id           │     │             │
         │                │    nombre       │     │             │
         │                │    descripcion  │     │             │
         │           ┌───▶│ FK entidad_id   │─────┘             │
         │           │    │    tipo         │                   │
         │           │    │    beneficios   │                   │
         │           │    │    vigencia_*   │                   │
         │           │    │    estado       │                   │
         │           │    │    created_at   │                   │
         │           │    │    updated_at   │                   │
         │           │    └────────┬────────┘                   │
         │           │             │                            │
         │           │             ▼                            │
         │           │    ┌─────────────────┐                  │
         │           │    │    Convenio     │                  │
         │           │    ├─────────────────┤                  │
         │           │    │ PK id           │                  │
         │           │    │    nombre       │                  │
         │           └────│ FK plan_id      │                  │
         │                │ FK negocio_id   │◀─────────────────┘
         │                │    descuento_%  │
         │                │    nivel_acceso │ (N1, N2, N3)
         │                │    vigencia_*   │
         │                │    estado       │
         │                │    created_at   │
         │                │    updated_at   │
         │                └────────┬────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   Transaccion   │       │    Producto     │
├─────────────────┤       ├─────────────────┤
│ PK id           │       │ PK id           │
│ FK usuario_id   │───┐   │    nombre       │
│ FK negocio_id   │   │   │    descripcion  │
│ FK convenio_id  │   │   │ FK negocio_id   │
│    monto_orig   │   │   │    precio       │
│    descuento_%  │   │   │    categoria    │
│    monto_final  │   │   │    stock        │
│    qr_code      │   │   │    imagen_url   │
│    estado       │   │   │    estado       │
│ ⊕  latitud      │   │   │    created_at   │
│ ⊕  longitud     │   │   │    updated_at   │
│    fecha_trans  │   │   └─────────────────┘
│    created_at   │   │
│    updated_at   │   │
└─────────────────┘   │
                      │
                      ▼
            ┌─────────────────┐
            │ Evento_Analytics│
            ├─────────────────┤
            │ PK id           │
            │ FK usuario_id   │
            │    tipo_evento  │
            │    metadata     │
            │ ⊕  latitud      │
            │ ⊕  longitud     │
            │    timestamp    │
            └─────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
⊕  = PostGIS Geography field
```

## Core Entities

### 1. Usuario (User)

Users are the end consumers of the platform. They belong to entities and can make transactions.

```sql
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(50) NOT NULL DEFAULT 'USUARIO',
    entidad_id UUID REFERENCES entidad(id) ON DELETE SET NULL,
    foto_url VARCHAR(500),
    fecha_nacimiento DATE,
    dni VARCHAR(20) UNIQUE,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_entidad ON usuario(entidad_id);
CREATE INDEX idx_usuario_estado ON usuario(estado);
CREATE INDEX idx_usuario_rol ON usuario(rol);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Roles**:
- `SUPER_ADMIN`: Platform administrator
- `ADMIN_ENTIDAD`: Entity administrator
- `ADMIN_NEGOCIO`: Business administrator
- `USUARIO`: Regular user

### 2. Entidad (Entity/Company)

Entities are organizations that provide benefit plans to their members/employees.

```sql
CREATE TABLE entidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    ruc VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    direccion TEXT,
    sitio_web VARCHAR(255),
    logo_url VARCHAR(500),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('EMPRESA', 'ASOCIACION', 'SINDICATO', 'CLUB', 'OTRO')),
    sector VARCHAR(100),
    num_empleados INTEGER,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_entidad_ruc ON entidad(ruc);
CREATE INDEX idx_entidad_estado ON entidad(estado);
CREATE INDEX idx_entidad_tipo ON entidad(tipo);

CREATE TRIGGER update_entidad_updated_at BEFORE UPDATE ON entidad
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Negocio (Business)

Businesses are merchants that offer products and discounts through the platform.

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE negocio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ruc VARCHAR(20) UNIQUE NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    direccion TEXT NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    sitio_web VARCHAR(255),
    logo_url VARCHAR(500),
    horario_atencion JSONB,
    -- PostGIS geospatial columns
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    ubicacion GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography
    ) STORED,
    calificacion NUMERIC(3, 2) DEFAULT 0.0,
    num_resenas INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE')),
    verificado BOOLEAN DEFAULT FALSE,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_negocio_categoria ON negocio(categoria);
CREATE INDEX idx_negocio_estado ON negocio(estado);
CREATE INDEX idx_negocio_ruc ON negocio(ruc);
CREATE INDEX idx_negocio_verificado ON negocio(verificado);
-- PostGIS spatial index (GIST)
CREATE INDEX idx_negocio_ubicacion ON negocio USING GIST(ubicacion);

CREATE TRIGGER update_negocio_updated_at BEFORE UPDATE ON negocio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Categorías comunes**:
- RESTAURANTE
- SALUD_BELLEZA
- ENTRETENIMIENTO
- EDUCACION
- TECNOLOGIA
- HOGAR
- MODA
- DEPORTES
- VIAJES
- SERVICIOS

### 4. Producto (Product)

Products are items or services offered by businesses.

```sql
CREATE TABLE producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    sku VARCHAR(50),
    stock INTEGER,
    imagen_url VARCHAR(500),
    imagenes JSONB, -- Array of image URLs
    especificaciones JSONB,
    tags TEXT[],
    destacado BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'AGOTADO', 'DESCONTINUADO', 'INACTIVO')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_producto_negocio ON producto(negocio_id);
CREATE INDEX idx_producto_categoria ON producto(categoria);
CREATE INDEX idx_producto_estado ON producto(estado);
CREATE INDEX idx_producto_tags ON producto USING GIN(tags);
CREATE INDEX idx_producto_destacado ON producto(destacado) WHERE destacado = TRUE;

CREATE TRIGGER update_producto_updated_at BEFORE UPDATE ON producto
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Plan (Benefit Plan)

Plans are benefit packages offered by entities to their members.

```sql
CREATE TABLE plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_id UUID NOT NULL REFERENCES entidad(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('BASICO', 'PREMIUM', 'CORPORATIVO', 'PERSONALIZADO')),
    beneficios JSONB,
    vigencia_inicio DATE NOT NULL,
    vigencia_fin DATE,
    max_usuarios INTEGER,
    costo_mensual NUMERIC(10, 2),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BORRADOR', 'VENCIDO')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_plan_entidad ON plan(entidad_id);
CREATE INDEX idx_plan_estado ON plan(estado);
CREATE INDEX idx_plan_vigencia ON plan(vigencia_inicio, vigencia_fin);

CREATE TRIGGER update_plan_updated_at BEFORE UPDATE ON plan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6. Convenio (Agreement)

Convenios define the discounts available through different access levels.

```sql
CREATE TABLE convenio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    plan_id UUID REFERENCES plan(id) ON DELETE CASCADE,
    negocio_id UUID NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    descuento_porcentaje NUMERIC(5, 2) NOT NULL CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
    descuento_monto_fijo NUMERIC(10, 2),
    nivel_acceso VARCHAR(10) NOT NULL CHECK (nivel_acceso IN ('N1', 'N2', 'N3')),
    vigencia_inicio DATE NOT NULL,
    vigencia_fin DATE,
    limite_usos INTEGER,
    usos_actuales INTEGER DEFAULT 0,
    dias_semana INTEGER[], -- 0=Domingo, 6=Sábado
    horario_inicio TIME,
    horario_fin TIME,
    condiciones TEXT,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'VENCIDO', 'PAUSADO')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_convenio_plan ON convenio(plan_id);
CREATE INDEX idx_convenio_negocio ON convenio(negocio_id);
CREATE INDEX idx_convenio_nivel_acceso ON convenio(nivel_acceso);
CREATE INDEX idx_convenio_estado ON convenio(estado);
CREATE INDEX idx_convenio_vigencia ON convenio(vigencia_inicio, vigencia_fin);

CREATE TRIGGER update_convenio_updated_at BEFORE UPDATE ON convenio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Access Levels (Nivel de Acceso)**:
- **N1**: Direct agreement between entity and business (highest priority)
- **N2**: Agreement through benefit plan
- **N3**: Public access (general promotions)

### 7. Transaccion (Transaction)

Transactions track all purchases and discount applications.

```sql
CREATE TABLE transaccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    negocio_id UUID NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    convenio_id UUID REFERENCES convenio(id) ON DELETE SET NULL,
    monto_original NUMERIC(10, 2) NOT NULL,
    descuento_porcentaje NUMERIC(5, 2) NOT NULL,
    descuento_monto NUMERIC(10, 2) NOT NULL,
    monto_final NUMERIC(10, 2) NOT NULL,
    qr_code VARCHAR(255) UNIQUE,
    qr_expiracion TIMESTAMP,
    -- PostGIS location where transaction occurred
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8),
    ubicacion GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        CASE 
            WHEN latitud IS NOT NULL AND longitud IS NOT NULL 
            THEN ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography
            ELSE NULL
        END
    ) STORED,
    metodo_pago VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'COMPLETADA', 'CANCELADA', 'RECHAZADA', 'EXPIRADA')),
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transaccion_usuario ON transaccion(usuario_id);
CREATE INDEX idx_transaccion_negocio ON transaccion(negocio_id);
CREATE INDEX idx_transaccion_convenio ON transaccion(convenio_id);
CREATE INDEX idx_transaccion_estado ON transaccion(estado);
CREATE INDEX idx_transaccion_fecha ON transaccion(fecha_transaccion);
CREATE INDEX idx_transaccion_qr ON transaccion(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX idx_transaccion_ubicacion ON transaccion USING GIST(ubicacion) WHERE ubicacion IS NOT NULL;

CREATE TRIGGER update_transaccion_updated_at BEFORE UPDATE ON transaccion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 8. Evento_Analytics (Analytics Event)

Events for tracking user behavior and generating analytics.

```sql
CREATE TABLE evento_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuario(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(50) NOT NULL,
    entidad VARCHAR(100), -- e.g., 'negocio', 'producto', 'convenio'
    entidad_id UUID,
    metadata JSONB,
    -- User location when event occurred
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8),
    ubicacion GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        CASE 
            WHEN latitud IS NOT NULL AND longitud IS NOT NULL 
            THEN ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::geography
            ELSE NULL
        END
    ) STORED,
    sesion_id VARCHAR(100),
    dispositivo VARCHAR(50),
    plataforma VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_evento_usuario ON evento_analytics(usuario_id);
CREATE INDEX idx_evento_tipo ON evento_analytics(tipo_evento);
CREATE INDEX idx_evento_timestamp ON evento_analytics(timestamp);
CREATE INDEX idx_evento_entidad ON evento_analytics(entidad, entidad_id);
CREATE INDEX idx_evento_ubicacion ON evento_analytics USING GIST(ubicacion) WHERE ubicacion IS NOT NULL;

-- Partitioning by month for better performance
CREATE TABLE evento_analytics_2024_01 PARTITION OF evento_analytics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- ... (create partitions for each month)
```

**Event Types**:
- `BUSQUEDA`: Search performed
- `VER_PRODUCTO`: Product viewed
- `VER_NEGOCIO`: Business viewed
- `GENERAR_QR`: QR code generated
- `VALIDAR_QR`: QR code validated
- `COMPARTIR`: Content shared
- `FAVORITO`: Item favorited
- `LOGIN`: User login
- `LOGOUT`: User logout

## PostGIS Spatial Queries

### 1. Find Nearby Businesses (Within Radius)

```sql
-- Find businesses within 5km of user location
SELECT 
    b.id,
    b.nombre,
    b.categoria,
    b.direccion,
    b.calificacion,
    ROUND(
        ST_Distance(
            b.ubicacion,
            ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography
        )::numeric,
        2
    ) AS distancia_metros
FROM negocio b
WHERE 
    b.estado = 'ACTIVO'
    AND ST_DWithin(
        b.ubicacion,
        ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography,
        5000  -- 5km in meters
    )
ORDER BY b.ubicacion <-> ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography
LIMIT 20;
```

### 2. Find Businesses in Bounding Box

```sql
-- Find businesses in a rectangular area (e.g., map viewport)
SELECT 
    b.id,
    b.nombre,
    b.latitud,
    b.longitud
FROM negocio b
WHERE 
    b.estado = 'ACTIVO'
    AND b.ubicacion && ST_MakeEnvelope(
        :minLon, :minLat,  -- Southwest corner
        :maxLon, :maxLat,  -- Northeast corner
        4326
    )::geography;
```

### 3. Find Nearest Business by Category

```sql
-- Find the nearest restaurant to user
SELECT 
    b.id,
    b.nombre,
    b.direccion,
    ROUND(
        ST_Distance(
            b.ubicacion,
            ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography
        )::numeric,
        2
    ) AS distancia_metros
FROM negocio b
WHERE 
    b.estado = 'ACTIVO'
    AND b.categoria = 'RESTAURANTE'
ORDER BY b.ubicacion <-> ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography
LIMIT 1;
```

### 4. Geolocation Analytics

```sql
-- Heat map of transactions by location
SELECT 
    ST_AsGeoJSON(
        ST_SnapToGrid(ubicacion::geometry, 0.01)
    ) as grid_point,
    COUNT(*) as num_transacciones,
    SUM(monto_final) as monto_total
FROM transaccion
WHERE 
    estado = 'COMPLETADA'
    AND ubicacion IS NOT NULL
    AND fecha_transaccion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ST_SnapToGrid(ubicacion::geometry, 0.01)
HAVING COUNT(*) > 5
ORDER BY num_transacciones DESC;
```

### 5. Find Users Near a Business

```sql
-- Find active users within 10km of a specific business
-- (assuming we track user last known location)
WITH business_location AS (
    SELECT ubicacion
    FROM negocio
    WHERE id = :businessId
)
SELECT 
    u.id,
    u.nombre,
    u.apellido,
    u.email
FROM usuario u
CROSS JOIN business_location bl
WHERE 
    u.estado = 'ACTIVO'
    AND ST_DWithin(
        bl.ubicacion,
        ST_SetSRID(ST_MakePoint(:userLon, :userLat), 4326)::geography,
        10000  -- 10km
    );
```

## Discount Calculation Logic

### Formula

```sql
-- The platform applies the maximum discount available to the user
-- descuentoFinal = MAX(descuentoNivel2, descuentoPlanEntidad)

CREATE OR REPLACE FUNCTION calcular_descuento_usuario(
    p_usuario_id UUID,
    p_negocio_id UUID
) RETURNS TABLE (
    convenio_id UUID,
    descuento_porcentaje NUMERIC,
    nivel_acceso VARCHAR,
    nombre_convenio VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH usuario_info AS (
        SELECT entidad_id FROM usuario WHERE id = p_usuario_id
    ),
    convenios_disponibles AS (
        SELECT 
            c.id,
            c.nombre,
            c.descuento_porcentaje,
            c.nivel_acceso,
            CASE 
                WHEN c.nivel_acceso = 'N1' THEN 3
                WHEN c.nivel_acceso = 'N2' THEN 2
                WHEN c.nivel_acceso = 'N3' THEN 1
            END as prioridad
        FROM convenio c
        LEFT JOIN plan p ON c.plan_id = p.id
        CROSS JOIN usuario_info ui
        WHERE 
            c.negocio_id = p_negocio_id
            AND c.estado = 'ACTIVO'
            AND CURRENT_DATE BETWEEN c.vigencia_inicio AND COALESCE(c.vigencia_fin, '9999-12-31')
            AND (
                -- N3: Available to everyone
                c.nivel_acceso = 'N3'
                OR 
                -- N2: User's entity has an active plan
                (c.nivel_acceso = 'N2' AND p.entidad_id = ui.entidad_id AND p.estado = 'ACTIVO')
                OR
                -- N1: Direct entity-business agreement
                (c.nivel_acceso = 'N1' AND p.entidad_id = ui.entidad_id)
            )
            AND (c.limite_usos IS NULL OR c.usos_actuales < c.limite_usos)
    )
    SELECT 
        cd.id,
        cd.descuento_porcentaje,
        cd.nivel_acceso,
        cd.nombre
    FROM convenios_disponibles cd
    ORDER BY cd.prioridad DESC, cd.descuento_porcentaje DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

## Views for Common Queries

### 1. Active Businesses with Convenios

```sql
CREATE VIEW v_negocios_activos AS
SELECT 
    n.id,
    n.nombre,
    n.categoria,
    n.direccion,
    n.latitud,
    n.longitud,
    n.calificacion,
    n.verificado,
    COUNT(DISTINCT c.id) as num_convenios,
    MAX(c.descuento_porcentaje) as max_descuento
FROM negocio n
LEFT JOIN convenio c ON n.id = c.negocio_id AND c.estado = 'ACTIVO'
WHERE n.estado = 'ACTIVO'
GROUP BY n.id;
```

### 2. User Transaction Summary

```sql
CREATE VIEW v_usuario_transacciones AS
SELECT 
    u.id as usuario_id,
    u.nombre,
    u.apellido,
    COUNT(t.id) as total_transacciones,
    SUM(t.monto_final) as monto_total_gastado,
    SUM(t.descuento_monto) as total_ahorrado,
    AVG(t.descuento_porcentaje) as descuento_promedio,
    MAX(t.fecha_transaccion) as ultima_transaccion
FROM usuario u
LEFT JOIN transaccion t ON u.id = t.usuario_id AND t.estado = 'COMPLETADA'
GROUP BY u.id, u.nombre, u.apellido;
```

### 3. Business Performance

```sql
CREATE VIEW v_negocio_performance AS
SELECT 
    n.id as negocio_id,
    n.nombre,
    COUNT(DISTINCT t.id) as num_transacciones,
    COUNT(DISTINCT t.usuario_id) as clientes_unicos,
    SUM(t.monto_final) as ingresos_total,
    AVG(t.monto_final) as ticket_promedio,
    n.calificacion,
    n.num_resenas
FROM negocio n
LEFT JOIN transaccion t ON n.id = t.negocio_id AND t.estado = 'COMPLETADA'
WHERE n.estado = 'ACTIVO'
GROUP BY n.id, n.nombre, n.calificacion, n.num_resenas;
```

## Sample Data

### Insert Sample Entity

```sql
INSERT INTO entidad (razon_social, nombre_comercial, ruc, email, direccion, tipo)
VALUES 
('Tech Corp S.A.C.', 'TechCorp', '20123456789', 'contacto@techcorp.com', 
 'Av. Tecnológica 123, Lima', 'EMPRESA');
```

### Insert Sample Business with Location

```sql
INSERT INTO negocio (nombre, ruc, categoria, direccion, telefono, latitud, longitud)
VALUES 
('Restaurante El Buen Sabor', '20987654321', 'RESTAURANTE', 
 'Av. Principal 456, Miraflores, Lima', '+51 1 234 5678',
 -12.1191, -77.0349);  -- Coordinates for Miraflores, Lima
```

### Insert Sample Plan

```sql
INSERT INTO plan (entidad_id, nombre, descripcion, tipo, vigencia_inicio, vigencia_fin)
VALUES 
((SELECT id FROM entidad WHERE ruc = '20123456789'),
 'Plan Corporativo Premium',
 'Plan con descuentos exclusivos para empleados',
 'CORPORATIVO',
 '2024-01-01',
 '2024-12-31');
```

### Insert Sample Convenio

```sql
INSERT INTO convenio (nombre, plan_id, negocio_id, descuento_porcentaje, nivel_acceso, vigencia_inicio)
VALUES 
('Descuento Almuerzo TechCorp',
 (SELECT id FROM plan WHERE nombre = 'Plan Corporativo Premium'),
 (SELECT id FROM negocio WHERE nombre = 'Restaurante El Buen Sabor'),
 20.0,
 'N2',
 '2024-01-01');
```

## Database Maintenance

### Vacuum and Analyze

```sql
-- Regular maintenance (run weekly)
VACUUM ANALYZE;

-- Specific tables
VACUUM ANALYZE transaccion;
VACUUM ANALYZE evento_analytics;
```

### Reindex Spatial Indexes

```sql
-- Reindex PostGIS indexes (run monthly)
REINDEX INDEX idx_negocio_ubicacion;
REINDEX INDEX idx_transaccion_ubicacion;
```

### Archive Old Data

```sql
-- Archive old analytics events (older than 1 year)
CREATE TABLE evento_analytics_archive AS
SELECT * FROM evento_analytics 
WHERE timestamp < CURRENT_DATE - INTERVAL '1 year';

DELETE FROM evento_analytics 
WHERE timestamp < CURRENT_DATE - INTERVAL '1 year';
```

## Performance Optimization

### Connection Pooling

- Use PgBouncer with pool size: 100-200 connections
- Transaction pooling mode for better efficiency

### Query Optimization

- Use `EXPLAIN ANALYZE` to identify slow queries
- Add indexes based on query patterns
- Use materialized views for complex aggregations

### PostGIS Performance

- Keep spatial indexes up to date
- Use appropriate SRID (4326 for GPS coordinates)
- Use geography type for accurate distance calculations
- Use geometry type for faster spatial operations when accuracy is less critical

## Backup Strategy

- **Full backup**: Daily at 2:00 AM
- **Incremental backup**: Every 6 hours
- **Point-in-Time Recovery (PITR)**: Enabled with WAL archiving
- **Retention**: 30 days
- **Test recovery**: Monthly

## Security

- **Encryption at rest**: TDE (Transparent Data Encryption)
- **Encryption in transit**: SSL/TLS required
- **Row-level security**: Enabled for multi-tenant isolation
- **Audit logging**: Track all DDL and sensitive DML operations
- **Password hashing**: bcrypt with salt (handled by application)

## References

- [PostGIS Documentation](https://postgis.net/docs/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Architecture Documentation](./ARCHITECTURE.md)
