# 🏥 Sistema de Automatización de Formularios Hospitalarios

Este proyecto es una aplicación backend que automatiza el llenado de formularios web para un programa hospitalario, procesando datos desde archivos Excel y enviándolos mediante Selenium WebDriver.

## 📋 Descripción

El sistema permite cargar archivos Excel con información de pacientes y automáticamente completa formularios web en el sitio de Alchemer. Está diseñado para manejar dos zonas diferentes (Lima y Selva) con lógicas específicas para cada una.

## 🚀 Características

- **API REST** con FastAPI para cargar archivos Excel
- **Procesamiento en tiempo real** con streaming de resultados
- **Automatización web** usando Selenium WebDriver
- **Soporte para múltiples zonas** (Lima y Selva)
- **Modo headless** configurable para ejecución en segundo plano
- **CORS habilitado** para integración con frontend

## 🛠️ Tecnologías

- **FastAPI** - Framework web moderno y rápido
- **Selenium** - Automatización de navegador web
- **Pandas** - Procesamiento de datos Excel
- **Uvicorn** - Servidor ASGI
- **ChromeDriver** - Driver para automatización de Chrome

## 📁 Estructura del Proyecto

```
backend/
├── chromeDriver/           # Driver de Chrome para Selenium
├── excel_files/           # Archivos Excel de entrada
├── main.py               # Aplicación principal FastAPI
├── selenium_worker.py    # Lógica de automatización web
├── excel_reader.py       # Lectura y procesamiento de Excel
├── utils.py             # Funciones utilitarias
└── requirements.txt     # Dependencias del proyecto
```

## 📊 Formato de Datos Excel

El archivo Excel debe contener las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| Nombre | Nombre del paciente |
| Apellido | Apellido del paciente |
| Número Celular | Número de teléfono |
| Zona | LIMA o SELVA |
| Es Primer Hijo | SI o NO |
| Fecha de Nacimiento | Fecha en formato Excel |

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd backend
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Configurar ChromeDriver**
   - Asegúrate de que ChromeDriver esté en la carpeta `chromeDriver/`
   - Actualiza la ruta en `selenium_worker.py` si es necesario

## ▶️ Uso

1. **Iniciar el servidor**
```bash
uvicorn main:app --reload
```

2. **Cargar archivo Excel**
```bash
curl -X POST "http://localhost:8000/upload/" \
  -F "file=@archivo.xlsx" \
  -F "headless=true"
```

3. **Ver resultados en tiempo real**
   - La API devuelve un stream de eventos con el progreso
   - Cada registro procesado se reporta individualmente

## 🎯 Funcionalidades por Zona

### Zonas Lima
- `LIMA` y `LIMA 2`: código `LIMVMJ02`
- `LIMA 3`: código `LIMVMJ03`
- `LIMA 4`: código `LIMVMJ04`
- `LIMA 6`: código `LIMVMJ06`
- Departamento: `Lima (departamento)`
- Fecha: generada aleatoriamente en 2025
- Siempre marca la opcion equivalente a "Es primer hijo"

### Otras zonas configuradas
- `CUSCO`: código `CUSVMJ`, departamento `Cusco`
- `CHICLAYO`: código `CIXVMJ`, departamento `Lambayeque`
- `AREQUIPA`: código `AQPVMJ`, departamento `Arequipa`
- `TRUJILLO 1`: código `TRUVMJ`, departamento `La Libertad`
- `TRUJILLO 2`: código `TRUVMJ2`, departamento `La Libertad`
- `HUANCAYO`: código `HCYOVMJ`, departamento `Junín`
- `ICA`: código `ICAVMJ`, departamento `Ica`
- `MADRE DE DIOS`: código `MDVMJ`, departamento `Madre de Dios`
- `SELVA`: código `SELVMJ`, departamento `Amazonas`
- Otras zonas: fallback a código `SELVMJ` y departamento `Amazonas`
- Para zonas no Lima, la fecha usa `Fecha de Nacimiento` y respeta `Es Primer Hijo`

## 📡 API Endpoints

### POST `/upload/`
Carga un archivo Excel y procesa los registros.

**Parámetros:**
- `file`: Archivo Excel (multipart/form-data)
- `headless`: Boolean para modo headless (opcional, default: true)

**Respuesta:** Stream de eventos con progreso en tiempo real

## ⚙️ Configuración

- **URL del formulario**: Configurada en `FORM_URL` en `selenium_worker.py`
- **Ruta ChromeDriver**: Configurada en `CHROME_DRIVER_PATH`
- **CORS**: Habilitado para todos los orígenes

## 🔍 Monitoreo

El sistema proporciona feedback en tiempo real:
- Total de registros a procesar
- Progreso individual por registro
- Estado de éxito/error para cada envío

## 🚨 Consideraciones

- Requiere Chrome instalado en el sistema
- ChromeDriver debe coincidir con la versión de Chrome
- Los archivos Excel se guardan temporalmente en `excel_files/`
- El sistema genera correos ficticios usando el formato `{numero}@nogmail.com`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request
