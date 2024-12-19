# Apoyo Escolar RV - Plataforma de Cursos Online

Esta plataforma permite a los estudiantes acceder a cursos online con las siguientes características:

## Características Principales

- 🎥 Reproductor de video con seguimiento de progreso
- 📊 Sistema de progreso por curso y por clase
- 🛒 Carrito de compras para adquirir cursos
- 👥 Sistema de autenticación de usuarios
- 📱 Diseño responsive y moderno
- 💬 Integración con grupos de WhatsApp

## Tecnologías Utilizadas

- **Frontend:**

  - Next.js 15 (App Router)
  - React Query para manejo de estado y caché
  - Tailwind CSS para estilos
  - Shadcn/ui para componentes de UI
  - TypeScript para tipado estático

- **Características Técnicas:**
  - Sistema de autenticación con JWT
  - Caché y revalidación automática
  - Manejo de estado global con React Query
  - Persistencia de progreso local y en servidor

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tuusuario/apoyoescolarrv.git
cd apoyoescolarrv
```

2. Instala las dependencias:

```bash
npm install
```

3. Copia el archivo de variables de entorno:

```bash
cp .env.example .env.local
```

4. Configura las variables de entorno en `.env.local`

5. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Estructura del Proyecto

```
src/
  ├── app/                    # App Router de Next.js
  ├── components/             # Componentes reutilizables
  ├── api/                    # Servicios y mutaciones de API
  ├── lib/                    # Utilidades y configuraciones
  └── types/                  # Tipos de TypeScript
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
