### APOYO ESCOLAR RV

## Descripción

Este es un LMS hecho con el siguiente stack:

- Next JS 15 (app router)
- React Query para fetching, mutations, caache y state global
- Tailwind CSS para estilos
- Shadcn UI para componentes
- TypeScript para tipado estático
- Zod para validación de datos
- React Hook Form para formularios
- React Player para reproducir videos
- Neon Postgres para base de datos
- JWT para autenticación de usuarios
- Vercel Blob para almacenamiento de archivos
- Next Js Api Routes para endpoints
- Pagos con mercado pago
- planes de mas o menos de un año
- bot de whatsapp con el service

## Características Técnicas

- Las sesiones generan un token JWT y se almacenan en cookies
- todas las tablas se encuentran en `@/db/schema.ts`
- las consultas y mutations las guardamos en `/src/api/`, ahi se muestra cada directorio con sus archivos y funcionalidades
- todos los endpoints se encuentran en `/src/app/api` con su directorio y su archivo `route.ts`
- para crear endpoints disponemos de dos funciones, `buildEndpoint` y `verifyToken` que nos permiten crear endpoints seguros y con autenticación respectivamente
