# massive-form-automation
Automatización masiva de registro de formularios web vía archivos Excel.
---

## 🚀 Descripción del Proyecto

Este sistema permite automatizar el llenado masivo de formularios web usando archivos Excel como fuente de datos. A través de una interfaz web moderna (Next.js + React + shadcn/ui) y un backend robusto en FastAPI + Selenium, el sistema permite:

* Subida de archivos Excel (.xlsx)
* Ejecución automática del llenado de formularios en tiempo real
* Visualización del progreso de cada registro
* Manejo de errores de forma individualizada
* Control de ejecución headless (modo oculto) o visible
* Totalmente parametrizable y extensible

---

## 🛠️ Tecnologías Utilizadas

### Frontend

* React 18 + Next.js 14 (App Router)
* Typescript
* TailwindCSS
* shadcn/ui
* Framer Motion
* Lucide Icons

### Backend

* FastAPI
* Python 3.11
* Selenium WebDriver
* ChromeDriver

### Infraestructura

* Comunicación Frontend ↔ Backend vía streaming SSE (Server Sent Events)
* Ejecución controlada por procesos asincrónicos

---

## 🎯 Funcionalidades

✅ Subida masiva de registros desde Excel
✅ Visualización en tiempo real del progreso
✅ Identificación y reporte de registros fallidos
✅ Validación automática de fechas y formatos
✅ Alternancia headless visible / no visible (útil para depuración)
✅ UI amigable, responsiva y moderna

---

## 📦 Instalación

### Clonar el proyecto

```bash
git clone https://github.com/tu-usuario/baby-form-automation-bot.git
cd baby-form-automation-bot
```

### Configurar el entorno Python (Backend)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # (en Windows)
pip install -r requirements.txt
```

### Configurar el entorno Frontend

```bash
cd frontend
npm install
npm run dev
```

⚠️ **Nota importante:**
Debes tener instalado y configurado correctamente ChromeDriver en el backend, compatible con tu versión actual de Chrome.

---

## 🚦 Ejecución

### Levantar el backend:

```bash
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Levantar el frontend:

```bash
cd frontend
npm run dev
```

Accede a:
[http://localhost:3000](http://localhost:3000)

---

## 🎯 Captura Visual

> Interfaz web con progreso en tiempo real:

![Screenshot](screenshot.png) *(puedes incluir capturas del sistema funcionando)*

---

## ⚠️ Advertencia

Este proyecto tiene fines educativos, de automatización controlada, bajo estricta supervisión del usuario responsable. No utilizar en producción sin los permisos adecuados de la plataforma de destino.

---

## 👑 Crédits

Desarrollado por peterbot 🤖
Adaptado y operado por **Peter Kukurelo** 🔥

---

---

# 🚀🚀🚀


