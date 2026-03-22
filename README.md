# CamilaProyecto

Automatizacion de carga masiva de formularios web a partir de archivos Excel.

El proyecto tiene tres piezas principales:

- `frontend`: interfaz web en Next.js para subir el Excel y ver el progreso.
- `backend`: API en FastAPI que lee el Excel y ejecuta Selenium.
- `nginx`: proxy que conecta frontend y backend bajo una sola URL.

## Stack

- Frontend: Next.js 15, React 18, TypeScript, Tailwind, shadcn/ui, Framer Motion
- Backend: FastAPI, Uvicorn, Selenium, Pandas, OpenPyXL
- Infraestructura: Docker, Docker Compose, Nginx, streaming SSE

## Flujo general

1. El usuario sube un archivo `.xlsx` desde la web.
2. El frontend envía el archivo a `POST /api/upload/`.
3. Nginx redirige `/api/` al backend.
4. El backend procesa el Excel por lotes.
5. Selenium abre el formulario, llena los datos y reporta cada resultado en tiempo real.

## Estructura

```text
CamilaProyecto/
├── backend/
│   ├── main.py
│   ├── selenium_worker.py
│   ├── excel_reader.py
│   ├── utils.py
│   ├── monitor.py
│   ├── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   ├── components/
│   ├── excel-processor.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## Requisitos

### Opcion recomendada

- Docker Desktop corriendo
- Docker Compose disponible

### Opcion local manual

- Python 3.11
- Node.js 18+
- Google Chrome o Chromium
- ChromeDriver compatible

## Ejecucion recomendada con Docker

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Cuando los servicios terminen de levantar, entra a:

```text
http://localhost
```

URLs utiles:

- App completa: `http://localhost`
- Frontend directo: `http://localhost:3000`
- Backend directo: `http://localhost:8000`

Para detener todo:

```bash
docker compose down
```

Para ver logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

## Ejecucion local manual

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Nota importante:
En el estado actual del proyecto, la integracion mas confiable es con Docker + Nginx. El frontend usa `fetch("/api/upload/")`, asi que levantar frontend y backend por separado puede requerir un proxy adicional si no pasas por Nginx.

## API

### `POST /upload/`

Recibe un archivo Excel y devuelve eventos en streaming con el avance del procesamiento.

Parametros:

- `file`: archivo `.xlsx`
- `headless`: `true` o `false`

Ejemplo con `curl`:

```bash
curl -X POST "http://localhost:8000/upload/" \
  -F "file=@archivo.xlsx" \
  -F "headless=true"
```

## Formato esperado del Excel

El archivo debe tener estas columnas exactas:

| Columna | Descripcion |
| --- | --- |
| Nombre | Nombre |
| Apellido | Apellido |
| Número Celular | Telefono |
| Zona | Zona operativa |
| Es Primer Hijo | `SI` o `NO` |
| Fecha de Nacimiento | Fecha valida de Excel |

Ejemplo de registros:

```csv
Nombre,Apellido,Número Celular,Zona,Es Primer Hijo,Fecha de Nacimiento
Camila,Rojas,987111111,LIMA,SI,2024-01-15
Mateo,Quispe,987222222,CUSCO,NO,2024-02-10
Valeria,Chavez,987333333,CHICLAYO,SI,2024-03-05
Luciano,Paredes,987444444,SELVA,NO,2024-04-20
Mariana,Delgado,987555555,LIMA,NO,2024-05-12
Thiago,Huaman,987666666,CUSCO,SI,2024-06-18
Ariana,Soto,987777777,PIURA,NO,2024-07-09
```

Encabezados exactos que espera el backend:

- `Nombre`
- `Apellido`
- `Número Celular`
- `Zona`
- `Es Primer Hijo`
- `Fecha de Nacimiento`

Si el nombre de columna no coincide, el backend fallara al leer el archivo.

## Logica actual por zona

El backend normaliza `Zona` en mayusculas y aplica este mapeo:

| Zona | Codigo enviado | Departamento seleccionado |
| --- | --- | --- |
| `LIMA` | `LIMVMJ02` | `Lima (departamento)` |
| `LIMA 2` | `LIMVMJ02` | `Lima (departamento)` |
| `LIMA 3` | `LIMVMJ03` | `Lima (departamento)` |
| `LIMA 4` | `LIMVMJ04` | `Lima (departamento)` |
| `LIMA 6` | `LIMVMJ06` | `Lima (departamento)` |
| `CUSCO` | `CUSVMJ` | `Cusco` |
| `CHICLAYO` | `CIXVMJ` | `Lambayeque` |
| `AREQUIPA` | `AQPVMJ` | `Arequipa` |
| `TRUJILLO 1` | `TRUVMJ` | `La Libertad` |
| `TRUJILLO 2` | `TRUVMJ2` | `La Libertad` |
| `SELVA` | `SELVMJ` | `Amazonas` |
| cualquier otra zona | `SELVMJ` | `Amazonas` |

Comportamiento adicional:

- `LIMA`, `LIMA 2`, `LIMA 3`, `LIMA 4` y `LIMA 6`: generan una fecha aleatoria de 2025 hasta la fecha actual.
- Otras zonas: usa `Fecha de Nacimiento` del Excel.
- `LIMA`, `LIMA 2`, `LIMA 3`, `LIMA 4` y `LIMA 6`: siempre marcan la opcion equivalente a primer hijo.
- Otras zonas: respeta `Es Primer Hijo`.
- El correo se genera automaticamente como `${numero}@nogmail.com`.

## Configuracion actual

Valores definidos en `backend/config.py`:

- Maximo por carga: `200`
- Tamano de lote: `5`
- Pausa entre lotes: `3` segundos
- Delay entre formularios: `0.1` segundos
- URL del formulario: `https://survey.alchemer.com/s3/6972673/hospital-program-form`

## Modo headless

- `headless=true`: Selenium corre sin mostrar navegador.
- `headless=false`: Selenium intenta mostrar la ventana del navegador.

Dentro de Docker, el backend fuerza modo headless con Chromium del contenedor.

## Streaming de resultados

El backend emite eventos como:

- `inicio`
- `batch_inicio`
- `procesando`
- `resultado`
- `batch_pausa`
- `error`
- `error_batch`

Cada `resultado` incluye:

- `index`
- `nombre`
- `success`
- `error` si aplica

## Manejo de errores

- Si falla un envio, el backend devuelve `success: false`.
- Intenta guardar un screenshot del error en `SCREENSHOTS_DIR`.
- Si ya hay un proceso en curso, `POST /upload/` responde `409`.

## Monitoreo

Existe un script auxiliar en `backend/monitor.py` para revisar consumo de recursos y limpiar procesos Chrome.

Ejemplos:

```bash
cd backend
source .venv/bin/activate
python monitor.py monitor 60
python monitor.py clean
```

## Notas tecnicas

- El frontend y el backend se conectan correctamente cuando pasan por Nginx.
- El backend procesa un lote reutilizando un mismo driver de Selenium.
- Los archivos Excel se guardan temporalmente en `backend/excel_files/`.
- El formulario considera exito cuando encuentra el texto `Thank You!`.

## Archivos clave

- `backend/main.py`: endpoint de carga y streaming SSE
- `backend/selenium_worker.py`: automatizacion Selenium y logica por zona
- `backend/excel_reader.py`: lectura del Excel
- `backend/utils.py`: fechas y correo generado
- `frontend/excel-processor.tsx`: UI de carga y progreso
- `nginx.conf`: proxy entre frontend y backend

## Estado actualizado

Este README ya contempla:

- soporte para `LIMA`, `LIMA 2`, `LIMA 3`, `LIMA 4`, `LIMA 6`, `CUSCO`, `CHICLAYO`, `AREQUIPA`, `TRUJILLO 1`, `TRUJILLO 2` y `SELVA`
- fallback a `SELVMJ` para otras zonas
- mapeo de departamentos actualizado
- ejecucion recomendada con Docker
- formato real del Excel que consume el backend
