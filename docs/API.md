# ZonaVIP Platform - API Documentation

## Overview

This document describes all API endpoints for the ZonaVIP platform microservices architecture.

**Base URL**: `https://api.zonavip.com`  
**API Version**: v1  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Response Format

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

## Error Responses

Standard error format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/register"
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## 1. Auth Service

Base: `/api/v1/auth`

### 1.1 Register User

Create a new user account.

**Endpoint**: `POST /auth/register`  
**Authentication**: Not required

**Request Body**:
```json
{
  "email": "usuario@example.com",
  "password": "SecurePass123!",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+51 987654321",
  "dni": "12345678",
  "fecha_nacimiento": "1990-05-15",
  "entidad_id": "uuid-optional"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "USUARIO",
    "estado": "ACTIVO"
  },
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "expires_in": 900
}
```

### 1.2 Login

Authenticate user and receive tokens.

**Endpoint**: `POST /auth/login`  
**Authentication**: Not required

**Request Body**:
```json
{
  "email": "usuario@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "USUARIO"
  },
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "expires_in": 900
}
```

### 1.3 Refresh Token

Get a new access token using refresh token.

**Endpoint**: `POST /auth/refresh`  
**Authentication**: Not required

**Request Body**:
```json
{
  "refresh_token": "eyJhbG..."
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbG...",
  "expires_in": 900
}
```

### 1.4 Logout

Invalidate tokens and end session.

**Endpoint**: `POST /auth/logout`  
**Authentication**: Required

**Request Body**:
```json
{
  "refresh_token": "eyJhbG..."
}
```

**Response** (204): No content

### 1.5 Get Profile

Get current user profile.

**Endpoint**: `GET /auth/profile`  
**Authentication**: Required

**Response** (200):
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+51 987654321",
  "dni": "12345678",
  "fecha_nacimiento": "1990-05-15",
  "foto_url": "https://...",
  "rol": "USUARIO",
  "entidad": {
    "id": "uuid",
    "razon_social": "Tech Corp S.A.C.",
    "nombre_comercial": "TechCorp"
  },
  "ultimo_acceso": "2024-01-15T10:30:00.000Z",
  "created_at": "2023-06-01T08:00:00.000Z"
}
```

### 1.6 Update Profile

Update user profile information.

**Endpoint**: `PUT /auth/profile`  
**Authentication**: Required

**Request Body**:
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez García",
  "telefono": "+51 987654321",
  "foto_url": "https://..."
}
```

**Response** (200): Updated user object

### 1.7 Change Password

Change user password.

**Endpoint**: `POST /auth/change-password`  
**Authentication**: Required

**Request Body**:
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewSecurePass123!"
}
```

**Response** (200):
```json
{
  "message": "Password changed successfully"
}
```

### 1.8 Forgot Password

Request password reset.

**Endpoint**: `POST /auth/forgot-password`  
**Authentication**: Not required

**Request Body**:
```json
{
  "email": "usuario@example.com"
}
```

**Response** (200):
```json
{
  "message": "Password reset email sent"
}
```

### 1.9 Reset Password

Reset password with token from email.

**Endpoint**: `POST /auth/reset-password`  
**Authentication**: Not required

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePass123!"
}
```

**Response** (200):
```json
{
  "message": "Password reset successfully"
}
```

## 2. Catalog Service

Base: `/api/v1/catalog`

### 2.1 Search Products & Businesses

Search with geolocation, filters, and pagination.

**Endpoint**: `GET /catalog/search`  
**Authentication**: Optional (better results when authenticated)

**Query Parameters**:
- `q` (string): Search query
- `lat` (number): User latitude
- `lon` (number): User longitude
- `radius` (number): Search radius in meters (default: 5000)
- `categoria` (string): Filter by category
- `min_descuento` (number): Minimum discount percentage
- `solo_destacados` (boolean): Only featured items
- `ordenar` (string): `distancia|calificacion|descuento|relevancia`
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response** (200):
```json
{
  "results": [
    {
      "tipo": "negocio",
      "id": "uuid",
      "nombre": "Restaurante El Buen Sabor",
      "descripcion": "Comida peruana tradicional",
      "categoria": "RESTAURANTE",
      "direccion": "Av. Principal 456, Miraflores",
      "latitud": -12.1191,
      "longitud": -77.0349,
      "distancia": 1250.5,
      "calificacion": 4.5,
      "logo_url": "https://...",
      "convenios": [
        {
          "id": "uuid",
          "descuento_porcentaje": 20,
          "nivel_acceso": "N2"
        }
      ],
      "max_descuento": 20
    },
    {
      "tipo": "producto",
      "id": "uuid",
      "nombre": "Almuerzo Ejecutivo",
      "precio": 25.00,
      "descuento_disponible": 15,
      "precio_final": 21.25,
      "imagen_url": "https://...",
      "negocio": {
        "id": "uuid",
        "nombre": "Restaurante El Buen Sabor",
        "distancia": 1250.5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "categoria": "RESTAURANTE",
    "radius": 5000
  }
}
```

### 2.2 Get Business Details

Get detailed information about a business.

**Endpoint**: `GET /catalog/businesses/:id`  
**Authentication**: Optional

**Response** (200):
```json
{
  "id": "uuid",
  "nombre": "Restaurante El Buen Sabor",
  "descripcion": "Restaurante de comida peruana tradicional con más de 20 años de experiencia",
  "categoria": "RESTAURANTE",
  "subcategoria": "Comida Peruana",
  "direccion": "Av. Principal 456, Miraflores, Lima",
  "latitud": -12.1191,
  "longitud": -77.0349,
  "telefono": "+51 1 234 5678",
  "email": "contacto@buensabor.com",
  "sitio_web": "https://buensabor.com",
  "logo_url": "https://...",
  "horario_atencion": {
    "lunes": { "abierto": true, "inicio": "11:00", "fin": "22:00" },
    "martes": { "abierto": true, "inicio": "11:00", "fin": "22:00" },
    "domingo": { "abierto": false }
  },
  "calificacion": 4.5,
  "num_resenas": 128,
  "verificado": true,
  "productos": [
    {
      "id": "uuid",
      "nombre": "Almuerzo Ejecutivo",
      "precio": 25.00,
      "imagen_url": "https://..."
    }
  ],
  "convenios_disponibles": [
    {
      "id": "uuid",
      "nombre": "Descuento Almuerzo TechCorp",
      "descuento_porcentaje": 20,
      "nivel_acceso": "N2",
      "vigencia_fin": "2024-12-31"
    }
  ],
  "distancia": 1250.5
}
```

### 2.3 Get Product Details

**Endpoint**: `GET /catalog/products/:id`  
**Authentication**: Optional

**Response** (200):
```json
{
  "id": "uuid",
  "nombre": "Almuerzo Ejecutivo",
  "descripcion": "Entrada, plato de fondo, postre y bebida",
  "precio": 25.00,
  "categoria": "ALIMENTOS",
  "subcategoria": "Menú",
  "imagen_url": "https://...",
  "imagenes": ["https://...", "https://..."],
  "especificaciones": {
    "entrada": ["Ensalada", "Sopa"],
    "plato_fondo": ["Lomo saltado", "Ají de gallina"],
    "incluye": "Postre y chicha morada"
  },
  "stock": 50,
  "estado": "DISPONIBLE",
  "negocio": {
    "id": "uuid",
    "nombre": "Restaurante El Buen Sabor",
    "direccion": "Av. Principal 456, Miraflores",
    "distancia": 1250.5
  },
  "descuento_disponible": 20,
  "precio_final": 20.00
}
```

### 2.4 Get Categories

Get all available categories.

**Endpoint**: `GET /catalog/categories`  
**Authentication**: Not required

**Response** (200):
```json
{
  "categories": [
    {
      "id": "RESTAURANTE",
      "nombre": "Restaurante",
      "icono": "restaurant",
      "subcategorias": [
        { "id": "COMIDA_PERUANA", "nombre": "Comida Peruana" },
        { "id": "COMIDA_ITALIANA", "nombre": "Comida Italiana" }
      ],
      "count": 245
    },
    {
      "id": "SALUD_BELLEZA",
      "nombre": "Salud y Belleza",
      "icono": "spa",
      "count": 156
    }
  ]
}
```

### 2.5 Get Nearby Businesses

Get businesses near user location.

**Endpoint**: `GET /catalog/nearby`  
**Authentication**: Optional

**Query Parameters**:
- `lat` (number, required): User latitude
- `lon` (number, required): User longitude
- `radius` (number): Radius in meters (default: 5000)
- `categoria` (string): Filter by category
- `limit` (number): Max results (default: 20)

**Response** (200):
```json
{
  "businesses": [
    {
      "id": "uuid",
      "nombre": "Restaurante El Buen Sabor",
      "categoria": "RESTAURANTE",
      "direccion": "Av. Principal 456",
      "latitud": -12.1191,
      "longitud": -77.0349,
      "distancia": 450.2,
      "calificacion": 4.5,
      "max_descuento": 20,
      "logo_url": "https://..."
    }
  ],
  "total": 15,
  "user_location": {
    "lat": -12.1200,
    "lon": -77.0350
  }
}
```

## 3. Convenios Service

Base: `/api/v1/convenios`

### 3.1 List Convenios

Get all agreements (filtered by user permissions).

**Endpoint**: `GET /convenios`  
**Authentication**: Required

**Query Parameters**:
- `negocio_id` (uuid): Filter by business
- `plan_id` (uuid): Filter by plan
- `nivel_acceso` (string): N1|N2|N3
- `estado` (string): ACTIVO|INACTIVO|VENCIDO
- `page` (number)
- `limit` (number)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Descuento Almuerzo TechCorp",
      "descripcion": "20% en almuerzos de lunes a viernes",
      "descuento_porcentaje": 20,
      "nivel_acceso": "N2",
      "vigencia_inicio": "2024-01-01",
      "vigencia_fin": "2024-12-31",
      "estado": "ACTIVO",
      "plan": {
        "id": "uuid",
        "nombre": "Plan Corporativo Premium",
        "entidad": {
          "id": "uuid",
          "nombre_comercial": "TechCorp"
        }
      },
      "negocio": {
        "id": "uuid",
        "nombre": "Restaurante El Buen Sabor",
        "categoria": "RESTAURANTE"
      },
      "condiciones": "Válido de 11:00 a 15:00",
      "usos_actuales": 45,
      "limite_usos": 1000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125
  }
}
```

### 3.2 Get Convenio Details

**Endpoint**: `GET /convenios/:id`  
**Authentication**: Required

**Response** (200): Full convenio object with related data

### 3.3 Calculate Available Discount

Calculate the best available discount for a user at a business.

**Endpoint**: `POST /convenios/calculate-discount`  
**Authentication**: Required

**Request Body**:
```json
{
  "negocio_id": "uuid",
  "monto": 100.00
}
```

**Response** (200):
```json
{
  "convenio_aplicable": {
    "id": "uuid",
    "nombre": "Descuento Almuerzo TechCorp",
    "descuento_porcentaje": 20,
    "nivel_acceso": "N2"
  },
  "calculo": {
    "monto_original": 100.00,
    "descuento_porcentaje": 20,
    "descuento_monto": 20.00,
    "monto_final": 80.00
  },
  "formula_aplicada": "MAX(descuentoNivel2, descuentoPlanEntidad)",
  "otros_convenios_disponibles": [
    {
      "id": "uuid",
      "descuento_porcentaje": 15,
      "nivel_acceso": "N3"
    }
  ]
}
```

### 3.4 Create Convenio

Create new agreement (Admin only).

**Endpoint**: `POST /convenios`  
**Authentication**: Required (ADMIN_ENTIDAD, ADMIN_NEGOCIO, SUPER_ADMIN)

**Request Body**:
```json
{
  "nombre": "Descuento Especial",
  "descripcion": "Descripción del convenio",
  "plan_id": "uuid",
  "negocio_id": "uuid",
  "descuento_porcentaje": 25,
  "nivel_acceso": "N2",
  "vigencia_inicio": "2024-01-01",
  "vigencia_fin": "2024-12-31",
  "limite_usos": 500,
  "condiciones": "Aplican restricciones"
}
```

**Response** (201): Created convenio object

### 3.5 Update Convenio

**Endpoint**: `PUT /convenios/:id`  
**Authentication**: Required (Admin)

**Request Body**: Partial convenio object

**Response** (200): Updated convenio object

### 3.6 Delete Convenio

**Endpoint**: `DELETE /convenios/:id`  
**Authentication**: Required (Admin)

**Response** (204): No content

### 3.7 List Plans

**Endpoint**: `GET /plans`  
**Authentication**: Required

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Plan Corporativo Premium",
      "descripcion": "Plan con descuentos exclusivos",
      "tipo": "CORPORATIVO",
      "entidad": {
        "id": "uuid",
        "nombre_comercial": "TechCorp"
      },
      "num_convenios": 45,
      "num_usuarios": 250,
      "estado": "ACTIVO"
    }
  ]
}
```

### 3.8 Get Plan Details

**Endpoint**: `GET /plans/:id`  
**Authentication**: Required

**Response** (200): Full plan object with convenios

## 4. Transaction Service

Base: `/api/v1/transactions`

### 4.1 Create Transaction

Create a new transaction (generate QR code).

**Endpoint**: `POST /transactions`  
**Authentication**: Required

**Request Body**:
```json
{
  "negocio_id": "uuid",
  "convenio_id": "uuid",
  "monto_original": 100.00,
  "latitud": -12.1191,
  "longitud": -77.0349,
  "productos": [
    {
      "producto_id": "uuid",
      "cantidad": 2,
      "precio_unitario": 50.00
    }
  ]
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "codigo": "TRX-2024-0001234",
  "usuario": {
    "id": "uuid",
    "nombre": "Juan Pérez"
  },
  "negocio": {
    "id": "uuid",
    "nombre": "Restaurante El Buen Sabor"
  },
  "convenio": {
    "id": "uuid",
    "descuento_porcentaje": 20
  },
  "monto_original": 100.00,
  "descuento_porcentaje": 20,
  "descuento_monto": 20.00,
  "monto_final": 80.00,
  "qr_code": "base64-encoded-qr-image",
  "qr_code_url": "https://...",
  "qr_expiracion": "2024-01-15T12:00:00.000Z",
  "estado": "PENDIENTE",
  "fecha_transaccion": "2024-01-15T11:00:00.000Z"
}
```

### 4.2 Get Transaction

**Endpoint**: `GET /transactions/:id`  
**Authentication**: Required

**Response** (200): Full transaction object

### 4.3 List User Transactions

**Endpoint**: `GET /transactions/user/:userId`  
**Authentication**: Required (own transactions or admin)

**Query Parameters**:
- `estado` (string): Filter by status
- `desde` (date): From date
- `hasta` (date): To date
- `page` (number)
- `limit` (number)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "codigo": "TRX-2024-0001234",
      "negocio": {
        "nombre": "Restaurante El Buen Sabor",
        "logo_url": "https://..."
      },
      "monto_original": 100.00,
      "monto_final": 80.00,
      "descuento_porcentaje": 20,
      "estado": "COMPLETADA",
      "fecha_transaccion": "2024-01-15T11:00:00.000Z"
    }
  ],
  "stats": {
    "total_transacciones": 45,
    "total_gastado": 3450.00,
    "total_ahorrado": 865.00
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### 4.4 Generate QR Code

Generate QR code for transaction.

**Endpoint**: `POST /qr/generate`  
**Authentication**: Required

**Request Body**:
```json
{
  "transaccion_id": "uuid"
}
```

**Response** (200):
```json
{
  "qr_code": "data:image/png;base64,...",
  "qr_code_url": "https://cdn.zonavip.com/qr/...",
  "expiracion": "2024-01-15T12:00:00.000Z",
  "codigo": "QR-ABC123XYZ"
}
```

### 4.5 Validate QR Code

Validate and complete transaction (Business use).

**Endpoint**: `POST /qr/validate`  
**Authentication**: Required (ADMIN_NEGOCIO)

**Request Body**:
```json
{
  "qr_code": "QR-ABC123XYZ",
  "negocio_id": "uuid"
}
```

**Response** (200):
```json
{
  "valido": true,
  "transaccion": {
    "id": "uuid",
    "codigo": "TRX-2024-0001234",
    "usuario": {
      "nombre": "Juan Pérez",
      "dni": "12345678"
    },
    "monto_original": 100.00,
    "monto_final": 80.00,
    "descuento_porcentaje": 20,
    "estado": "COMPLETADA"
  },
  "mensaje": "Transacción validada exitosamente"
}
```

**Response** (400) - Invalid QR:
```json
{
  "valido": false,
  "error": "QR_EXPIRADO",
  "mensaje": "El código QR ha expirado"
}
```

### 4.6 Transaction History

Get complete transaction history with filters.

**Endpoint**: `GET /transactions/history`  
**Authentication**: Required

**Query Parameters**:
- `estado` (string)
- `negocio_id` (uuid)
- `desde` (date)
- `hasta` (date)
- `page`, `limit`

**Response** (200): Paginated transaction list

## 5. Notification Service

Base: `/api/v1/notifications`

### 5.1 Send Push Notification

**Endpoint**: `POST /notifications/push`  
**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "user_ids": ["uuid1", "uuid2"],
  "titulo": "Nuevo descuento disponible",
  "mensaje": "20% en tu restaurante favorito",
  "data": {
    "tipo": "DESCUENTO",
    "negocio_id": "uuid"
  },
  "prioridad": "alta"
}
```

**Response** (200):
```json
{
  "enviados": 150,
  "fallidos": 5,
  "mensaje": "Notificaciones enviadas exitosamente"
}
```

### 5.2 Send WhatsApp Message

**Endpoint**: `POST /notifications/whatsapp`  
**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "telefono": "+51987654321",
  "plantilla": "confirmacion_transaccion",
  "parametros": {
    "nombre": "Juan",
    "codigo": "TRX-0001234",
    "monto": "80.00"
  }
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "estado": "ENVIADO",
  "telefono": "+51987654321"
}
```

### 5.3 Send Email

**Endpoint**: `POST /notifications/email`  
**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "destinatario": "usuario@example.com",
  "asunto": "Confirmación de transacción",
  "plantilla": "transaccion_completada",
  "datos": {
    "nombre": "Juan",
    "codigo": "TRX-0001234",
    "monto": "80.00"
  }
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "estado": "ENVIADO"
}
```

### 5.4 Get User Notifications

**Endpoint**: `GET /notifications/user/:userId`  
**Authentication**: Required

**Query Parameters**:
- `leido` (boolean): Filter by read status
- `tipo` (string): Filter by notification type
- `page`, `limit`

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Nuevo descuento disponible",
      "mensaje": "20% en tu restaurante favorito",
      "tipo": "DESCUENTO",
      "leido": false,
      "fecha": "2024-01-15T10:00:00.000Z",
      "data": {
        "negocio_id": "uuid"
      }
    }
  ],
  "no_leidas": 5,
  "total": 48
}
```

### 5.5 Mark as Read

**Endpoint**: `PUT /notifications/:id/read`  
**Authentication**: Required

**Response** (200):
```json
{
  "id": "uuid",
  "leido": true
}
```

## 6. Analytics Service

Base: `/api/v1/analytics`

### 6.1 Get KPIs

Get key performance indicators.

**Endpoint**: `GET /analytics/kpis`  
**Authentication**: Required (Admin)

**Query Parameters**:
- `periodo` (string): `hoy|semana|mes|trimestre|año|personalizado`
- `desde` (date): For custom period
- `hasta` (date): For custom period
- `entidad_id` (uuid): Filter by entity
- `negocio_id` (uuid): Filter by business

**Response** (200):
```json
{
  "periodo": {
    "inicio": "2024-01-01",
    "fin": "2024-01-31",
    "dias": 31
  },
  "kpis": {
    "usuarios_activos": {
      "total": 1250,
      "dau": 450,
      "mau": 1100,
      "variacion_mes_anterior": 12.5
    },
    "transacciones": {
      "total": 3450,
      "completadas": 3200,
      "canceladas": 150,
      "tasa_conversion": 92.75,
      "ticket_promedio": 85.50,
      "monto_total": 273600.00
    },
    "descuentos": {
      "total_otorgado": 68400.00,
      "descuento_promedio": 21.4,
      "tasa_uso": 78.5
    },
    "geolocalizacion": {
      "busquedas_con_ubicacion": 8900,
      "transacciones_geolocalizadas": 2850,
      "tasa_conversion_geo": 32.0
    },
    "negocios": {
      "activos": 245,
      "nuevos_mes": 18,
      "con_transacciones": 198
    }
  }
}
```

### 6.2 Get Reports

Generate analytics reports.

**Endpoint**: `GET /analytics/reports/:type`  
**Authentication**: Required (Admin)

**Report Types**:
- `transacciones`: Transaction report
- `usuarios`: User activity report
- `negocios`: Business performance report
- `convenios`: Agreement utilization report

**Query Parameters**:
- `desde`, `hasta` (dates)
- `formato` (string): `json|csv|pdf`

**Response** (200):
```json
{
  "reporte": "transacciones",
  "periodo": {
    "inicio": "2024-01-01",
    "fin": "2024-01-31"
  },
  "resumen": {
    "total_transacciones": 3450,
    "monto_total": 273600.00,
    "descuento_total": 68400.00
  },
  "por_categoria": [
    {
      "categoria": "RESTAURANTE",
      "transacciones": 1850,
      "monto": 142500.00,
      "porcentaje": 53.6
    }
  ],
  "tendencias": {
    "diaria": [...],
    "semanal": [...]
  }
}
```

### 6.3 Dashboard Data

Get aggregated dashboard data.

**Endpoint**: `GET /analytics/dashboard`  
**Authentication**: Required (Admin)

**Response** (200):
```json
{
  "metricas_tiempo_real": {
    "usuarios_online": 125,
    "transacciones_hoy": 48,
    "monto_hoy": 3850.00
  },
  "graficos": {
    "transacciones_ultimos_30_dias": [...],
    "top_categorias": [...],
    "top_negocios": [...]
  },
  "alertas": [
    {
      "tipo": "WARNING",
      "mensaje": "Uso de convenio llegando al límite",
      "convenio_id": "uuid"
    }
  ]
}
```

### 6.4 Geolocation Stats

Get geolocation-based analytics.

**Endpoint**: `GET /analytics/geolocation-stats`  
**Authentication**: Required (Admin)

**Query Parameters**:
- `lat`, `lon`: Center coordinates
- `radius`: Analysis radius (meters)
- `desde`, `hasta`: Date range

**Response** (200):
```json
{
  "zona": {
    "centro": { "lat": -12.1191, "lon": -77.0349 },
    "radio": 5000,
    "nombre": "Miraflores, Lima"
  },
  "estadisticas": {
    "total_transacciones": 450,
    "monto_total": 35800.00,
    "negocios_activos": 28,
    "usuarios_unicos": 312
  },
  "mapa_calor": [
    {
      "latitud": -12.1191,
      "longitud": -77.0349,
      "intensidad": 85,
      "transacciones": 45
    }
  ],
  "top_negocios_zona": [...]
}
```

### 6.5 Track Event

Track analytics event (user behavior).

**Endpoint**: `POST /analytics/events`  
**Authentication**: Required

**Request Body**:
```json
{
  "tipo_evento": "BUSQUEDA",
  "entidad": "negocio",
  "entidad_id": "uuid",
  "metadata": {
    "query": "restaurante",
    "categoria": "RESTAURANTE",
    "resultados": 25
  },
  "latitud": -12.1191,
  "longitud": -77.0349
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Rate Limiting

All endpoints are rate-limited:

- **Authenticated requests**: 1000 requests/hour
- **Unauthenticated requests**: 100 requests/hour
- **Search endpoints**: 200 requests/hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1642248000
```

## Pagination

Standard pagination parameters:
- `page`: Page number (1-indexed)
- `limit`: Items per page (max 100)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "total_pages": 23,
    "has_next": true,
    "has_prev": false
  }
}
```

## Webhooks

Webhooks for external integrations:

### Transaction Completed

```json
POST https://client-webhook-url.com/transaction-completed
{
  "event": "transaction.completed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "transaction_id": "uuid",
    "codigo": "TRX-0001234",
    "monto_final": 80.00,
    "negocio_id": "uuid"
  }
}
```

## SDKs & Libraries

Official SDKs available:
- **JavaScript/TypeScript**: `@zonavip/sdk-js`
- **Python**: `zonavip-sdk`
- **PHP**: `zonavip/sdk-php`

## Support

- **API Status**: https://status.zonavip.com
- **Documentation**: https://docs.zonavip.com
- **Support Email**: api-support@zonavip.com
