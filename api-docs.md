# Documentación de API Endpoints

## Autenticación

### POST `/api/auth/login`

- **Descripción**: Inicia sesión de usuario
- **Body**: `{ email: string, password: string }`
- **Respuesta**: `{ user: User, token: string }`
- **Protegido**: No

### POST `/api/auth/register`

- **Descripción**: Registra un nuevo usuario
- **Body**: `{ name: string, email: string, password: string }`
- **Respuesta**: `{ user: User, token: string }`
- **Protegido**: No

## Cursos

### GET `/api/courses`

- **Descripción**: Obtiene lista de cursos disponibles
- **Query Params**:
  - `search?: string`
  - `category?: string`
  - `page?: number`
- **Respuesta**: `{ courses: Course[], total: number }`
- **Protegido**: No

### GET `/api/courses/[slug]`

- **Descripción**: Obtiene detalles de un curso específico
- **Params**: `slug: string`
- **Respuesta**: `Course`
- **Protegido**: No

### GET `/api/courses/[slug]/progress`

- **Descripción**: Obtiene progreso del usuario en un curso
- **Params**: `slug: string`
- **Respuesta**: `{ progress: number, completedLessons: string[] }`
- **Protegido**: Sí

### POST `/api/courses/[slug]/progress`

- **Descripción**: Actualiza progreso del curso
- **Params**: `slug: string`
- **Body**: `{ progress: number }`
- **Respuesta**: `{ success: boolean }`
- **Protegido**: Sí

## Videos

### GET `/api/videos/[id]`

- **Descripción**: Obtiene URL temporal para reproducir video
- **Params**: `id: string`
- **Respuesta**: `{ url: string }`
- **Protegido**: Sí
- **Notas**: Verifica permisos de acceso y genera token temporal

### GET `/api/videos/stream/[token]`

- **Descripción**: Endpoint para streaming de video
- **Params**: `token: string`
- **Respuesta**: Redirección al video o error 403
- **Protegido**: Por token temporal
- **Notas**: Valida token y previene cacheo

## Carrito y Compras

### GET `/api/cart`

- **Descripción**: Obtiene items en el carrito
- **Respuesta**: `{ items: CartItem[] }`
- **Protegido**: Sí

### POST `/api/cart`

- **Descripción**: Agrega item al carrito
- **Body**: `{ courseId: string }`
- **Respuesta**: `{ cart: Cart }`
- **Protegido**: Sí

### DELETE `/api/cart/[courseId]`

- **Descripción**: Elimina item del carrito
- **Params**: `courseId: string`
- **Respuesta**: `{ success: boolean }`
- **Protegido**: Sí

### POST `/api/cart/checkout`

- **Descripción**: Inicia proceso de checkout
- **Body**: `{ items: string[], planType: 'annual' | 'monthly' }`
- **Respuesta**: `{ checkoutUrl: string }`
- **Protegido**: Sí

## Compras

### GET `/api/purchases`

- **Descripción**: Lista compras del usuario
- **Respuesta**: `{ purchases: Purchase[] }`
- **Protegido**: Sí

### POST `/api/purchases/webhook`

- **Descripción**: Webhook para actualizar estado de pagos
- **Body**: Payload de Mercado Pago
- **Respuesta**: `{ success: boolean }`
- **Protegido**: Por firma de Mercado Pago

## Clases

### GET `/api/classes/[id]/progress`

- **Descripción**: Obtiene progreso en una clase específica
- **Params**: `id: string`
- **Respuesta**: `{ progress: number, completed: boolean }`
- **Protegido**: Sí

### POST `/api/classes/[id]/progress`

- **Descripción**: Actualiza progreso en una clase
- **Params**: `id: string`
- **Body**: `{ seconds: number, completed: boolean }`
- **Respuesta**: `{ success: boolean }`
- **Protegido**: Sí

## Notas Generales

### Autenticación

- Todos los endpoints protegidos requieren JWT en header: `Authorization: Bearer {token}`
- Los tokens expiran en 24 horas
- Errores de autenticación devuelven 401

### Rate Limiting

- Límite de 100 requests por minuto por IP
- Endpoints de video tienen límite especial de 30 por minuto

### Respuestas de Error

```typescript
{
  error: string;
  message?: string;
  code?: string;
}
```

### Códigos HTTP

- 200: Éxito
- 201: Creado
- 400: Error en request
- 401: No autenticado
- 403: No autorizado
- 404: No encontrado
- 429: Rate limit excedido
- 500: Error interno
