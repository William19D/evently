# Despliegue de Edge Function - Espacios Públicos

## Resumen
Se ha implementado una edge function para mostrar espacios aprobados sin necesidad de autenticación. Esta función permite a cualquier usuario ver los espacios disponibles para eventos.

## Archivos Creados

### 1. Edge Function
- **Archivo**: `supabase/functions/public-spaces/index.ts`
- **URL**: `https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/public-spaces`
- **Métodos**: GET, OPTIONS (CORS)
- **Autenticación**: No requerida (usa ANON_KEY)

### 2. Cliente Frontend
- **Archivo**: `src/lib/publicSpacesClient.ts`
- **Funciones**: 
  - `getPublicSpaces()` - Lista paginada de espacios
  - `getPublicSpace(id)` - Espacio específico con detalles
  - Métodos de filtrado por tipo, ubicación, capacidad, precio

### 3. Páginas Frontend
- **Lista**: `src/pages/PublicSpaces.tsx` - Página de búsqueda y listado
- **Detalles**: `src/pages/PublicSpaceDetails.tsx` - Vista detallada de espacio
- **Rutas**: 
  - `/spaces` - Lista de espacios
  - `/spaces/:spaceId` - Detalles de espacio específico

### 4. Navegación
- Agregado enlace "Espacios" en navegación principal
- Agregado botón "Ver Todos los Espacios" en la página principal

## Pasos para Desplegar la Edge Function

### 1. Instalar Supabase CLI (si no está instalado)
```bash
npm install -g supabase
```

### 2. Autenticarse
```bash
supabase login
```

### 3. Enlazar al proyecto
```bash
cd "C:\Users\Daniel\Documents\Evently\evently"
supabase link --project-ref xchgmvpzygpenccnidtq
```

### 4. Desplegar la función
```bash
supabase functions deploy public-spaces
```

### 5. Verificar el despliegue
Prueba la función accediendo a:
```
https://xchgmvpzygpenccnidtq.supabase.co/functions/v1/public-spaces
```

## Funcionalidades Implementadas

### Edge Function Features:
- ✅ Solo espacios con status "approved" 
- ✅ Sin información sensible (emails, IDs de usuario, etc.)
- ✅ Filtros: tipo, capacidad, precio, ubicación, búsqueda de texto
- ✅ Paginación (página, límite, total)
- ✅ Ordenamiento (fecha, nombre, precio, capacidad)
- ✅ Inclución opcional de reviews anónimos
- ✅ Información de amenidades y fotos
- ✅ Ratings promedio y conteo de reviews
- ✅ CORS habilitado para acceso público
- ✅ Logs detallados para debugging

### Frontend Features:
- ✅ Página de búsqueda con filtros avanzados
- ✅ Tarjetas de espacios con información esencial
- ✅ Página de detalles con galería de fotos
- ✅ Sistema de ratings visuales (estrellas)
- ✅ Paginación de resultados
- ✅ Búsqueda por texto
- ✅ Filtros por tipo, capacidad, precio
- ✅ Responsive design
- ✅ Integración con navegación principal

## Parámetros de la API

### GET /functions/v1/public-spaces

#### Parámetros de consulta:
- `id` - ID específico del espacio
- `type` - Tipo de espacio (salon, auditorio, jardin, etc.)
- `min_capacity` - Capacidad mínima
- `max_capacity` - Capacidad máxima  
- `min_price` - Precio mínimo por hora
- `max_price` - Precio máximo por hora
- `location` - Búsqueda en ubicación (texto parcial)
- `search` - Búsqueda en nombre, descripción y ubicación
- `sort_by` - Campo de ordenamiento (created_at, space_name, price_per_hour_cop, max_capacity)
- `sort_order` - Orden (asc, desc)
- `page` - Número de página (default: 1)
- `limit` - Espacios por página (default: 12, max: 50)
- `include_reviews` - Incluir reviews (true/false)

#### Ejemplos de uso:
```
# Todos los espacios
GET /functions/v1/public-spaces

# Espacios tipo salón
GET /functions/v1/public-spaces?type=salon

# Búsqueda por ubicación
GET /functions/v1/public-spaces?location=Armenia

# Filtros combinados
GET /functions/v1/public-spaces?type=auditorio&min_capacity=100&max_price=500000

# Espacio específico con reviews
GET /functions/v1/public-spaces?id=123&include_reviews=true

# Búsqueda con texto
GET /functions/v1/public-spaces?search=matrimonio&sort_by=price_per_hour_cop&sort_order=asc
```

## Estructura de Respuesta

### Lista de espacios:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Salón Jardín del Eden",
      "description": "Hermoso salón para eventos especiales...",
      "type": "salon",
      "capacity": 150,
      "location": "Armenia, Quindío",
      "price_per_hour": 250000,
      "price_formatted": "$250.000 COP",
      "rating": {
        "average": 4.5,
        "count": 12,
        "stars": 4.5
      },
      "amenities": [...],
      "photos": [...],
      "availability": {
        "status": "available",
        "published_at": "2025-01-01T00:00:00Z"
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "total_pages": 4,
    "has_next": true,
    "has_prev": false
  },
  "metadata": {
    "query_time": "2025-09-06T07:23:11Z",
    "api_version": "public-v1",
    "filters": {...},
    "sort": {...},
    "include_reviews": false
  }
}
```

## Próximos Pasos

1. **Desplegar la edge function** usando los comandos arriba
2. **Probar la API** desde el frontend
3. **Opcional**: Configurar caché para mejorar performance
4. **Opcional**: Agregar analytics para trackear uso
5. **Opcional**: Implementar sistema de favoritos local
6. **Opcional**: Agregar página de contacto desde detalles de espacio

## Notas Importantes

- La función usa la ANON_KEY de Supabase para acceso público
- No expone información sensible de usuarios o propietarios
- Los reviews son anónimos por privacidad
- Solo se muestran espacios con status "approved"
- La función incluye logs detallados para debugging
- CORS está habilitado para uso desde cualquier dominio
