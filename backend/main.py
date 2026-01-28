from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import shutil
import asyncio
import os
from selenium_worker import procesar_excel_streaming

app = FastAPI()

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# GLOBAL LOCK (CLAVE DEL FIX)
# ─────────────────────────────────────────────

PROCESSING = False


# ─────────────────────────────────────────────
# Upload endpoint
# ─────────────────────────────────────────────

@app.post("/upload/")
async def upload_excel(
    file: UploadFile = File(...),
    headless: bool = Form(True),
):
    global PROCESSING

    if PROCESSING:
        raise HTTPException(
            status_code=409,
            detail="Ya hay un proceso en ejecución"
        )

    PROCESSING = True
    print("🔥 /upload llamado")

    # Guardar archivo
    os.makedirs("excel_files", exist_ok=True)
    file_location = f"excel_files/{file.filename}"

    with open(file_location, "wb") as f:
        shutil.copyfileobj(file.file, f)

    async def event_generator():
        global PROCESSING
        try:
            async for resultado in procesar_excel_streaming(
                file_location, headless
            ):
                yield f"data: {resultado}\n\n"
                await asyncio.sleep(0.01)
        finally:
            # 🔓 LIBERAR LOCK SIEMPRE
            PROCESSING = False
            try:
                os.remove(file_location)
            except Exception:
                pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
