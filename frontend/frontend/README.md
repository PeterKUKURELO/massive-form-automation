# 📊 Procesador de Excel en Tiempo Real

Un sistema moderno de procesamiento de archivos Excel con interfaz web interactiva que permite cargar archivos .xlsx y procesar los registros en tiempo real con feedback visual inmediato.

## 🚀 Características Principales

- **Procesamiento en Tiempo Real**: Visualiza el progreso del procesamiento registro por registro
- **Interfaz Moderna**: Diseño elegante con tema claro/oscuro usando Tailwind CSS
- **Streaming de Datos**: Recibe actualizaciones en vivo del backend mediante Server-Sent Events
- **Validación de Archivos**: Solo acepta archivos Excel (.xlsx) válidos
- **Manejo de Errores**: Muestra errores específicos para registros que fallan
- **Modo Headless**: Opción para procesar con o sin interfaz gráfica del navegador
- **Animaciones Fluidas**: Transiciones suaves con Framer Motion
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.2.4** - Framework de React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos utilitarios
- **Framer Motion** - Animaciones y transiciones
- **React Hook Form + Zod** - Manejo y validación de formularios
- **Radix UI** - Componentes de interfaz accesibles
- **Lucide React** - Iconos modernos

### Componentes UI
- **shadcn/ui** - Sistema de componentes reutilizables
- Más de 40 componentes UI pre-construidos (Button, Card, Form, Progress, etc.)
- Tema personalizado con paleta de colores rosa/pink

## 📁 Estructura del Proyecto

```
frontend/
├── app/                    # App Router de Next.js
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de shadcn/ui
│   ├── theme-provider.tsx # Proveedor de temas
│   └── theme-toggle.tsx   # Botón cambio de tema
├── hooks/                # Custom hooks
├── lib/                  # Utilidades
├── public/               # Archivos estáticos
├── styles/               # Estilos adicionales
├── excel-processor.tsx   # Componente principal del procesador
├── package.json          # Dependencias del proyecto
├── tailwind.config.ts    # Configuración de Tailwind
├── tsconfig.json         # Configuración de TypeScript
└── next.config.mjs       # Configuración de Next.js
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm, yarn o pnpm

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd frontend/frontend
```

2. **Instalar dependencias**
```bash
# Con npm
npm install

# Con yarn
yarn install

# Con pnpm
pnpm install
```

3. **Configurar variables de entorno** (opcional)
```bash
# Crear archivo .env.local si es necesario
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🚀 Scripts Disponibles

```bash
npm run dev      # Ejecuta en modo desarrollo
npm run build    # Construye para producción
npm run start    # Ejecuta la versión de producción
npm run lint     # Ejecuta el linter
```

## 🔌 Integración con Backend

El frontend se conecta a un backend que debe estar ejecutándose en `http://localhost:8000` y debe proporcionar:

### Endpoint Principal
- **POST** `/upload/` - Recibe archivos Excel y procesa registros

### Formato de Respuesta (Server-Sent Events)
```javascript
// Mensaje inicial con total de registros
data: {"total": 100}

// Mensajes de progreso por cada registro
data: {"index": 1, "nombre": "Registro 1", "success": true}
data: {"index": 2, "nombre": "Registro 2", "success": false, "error": "Error específico"}
```

### Parámetros de Envío
- `file`: Archivo Excel (.xlsx)
- `headless`: Boolean para modo headless

## 🎨 Personalización de Tema

El proyecto incluye un sistema de temas personalizable:

### Colores Principales
- **Rosa/Pink**: Paleta principal del diseño
- **Modo Claro**: Fondos claros con acentos rosados
- **Modo Oscuro**: Fondos oscuros con acentos rosados

### Modificar Colores
Edita `tailwind.config.ts` para cambiar la paleta de colores:

```typescript
colors: {
  rose: {
    50: "#fdf2f8",
    // ... más tonos
  }
}
```

## 📱 Funcionalidades de la Interfaz

### Carga de Archivos
- Drag & drop o selección manual
- Validación automática de formato Excel
- Feedback visual inmediato

### Procesamiento en Vivo
- Barra de progreso en tiempo real
- Lista de registros procesados
- Indicadores de éxito/error por registro

### Manejo de Errores
- Sección dedicada para errores
- Descripción específica de cada error
- Alertas visuales diferenciadas

### Controles
- Toggle para modo headless
- Cambio de tema claro/oscuro
- Contador de registros totales

## 🔍 Componentes Principales

### ExcelProcessor
Componente principal que maneja:
- Carga de archivos
- Comunicación con backend
- Streaming de datos
- Actualización de estado en tiempo real

### Componentes UI Utilizados
- `Card` - Contenedores de contenido
- `Form` - Formularios con validación
- `Progress` - Barras de progreso
- `Badge` - Etiquetas de estado
- `Alert` - Mensajes de error
- `Button` - Botones interactivos

## 🚀 Despliegue

### Construcción para Producción
```bash
npm run build
npm run start
```

### Variables de Entorno para Producción
```bash
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
```

### Plataformas Recomendadas
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker**

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Peter Kukurelo**
- Sistema generado con tecnologías modernas
- Enfoque en experiencia de usuario y rendimiento

## 🐛 Reporte de Bugs

Si encuentras algún problema, por favor:
1. Verifica que no exista un issue similar
2. Crea un nuevo issue con descripción detallada
3. Incluye pasos para reproducir el error
4. Adjunta capturas de pantalla si es necesario

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)

---

*Desarrollado con ❤️ usando tecnologías modernas de React y Next.js*