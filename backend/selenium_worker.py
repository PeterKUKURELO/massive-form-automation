import json
import os
import asyncio
import time
from excel_reader import leer_excel
from utils import generar_fecha_lima, formatear_fecha_selva, generar_correo

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

FORM_URL = "https://survey.alchemer.com/s3/6972673/hospital-program-form"


# ─────────────────────────────────────────────
# Driver
# ─────────────────────────────────────────────

def iniciar_driver(headless=False):
    options = webdriver.ChromeOptions()
    is_docker = os.path.exists("/.dockerenv")

    if is_docker:
        options.add_argument("--headless=new")
        options.binary_location = "/usr/bin/chromium"
        service = Service("/usr/bin/chromedriver")
    else:
        if headless:
            options.add_argument("--headless")
        service = Service()

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    return webdriver.Chrome(service=service, options=options)


# ─────────────────────────────────────────────
# Envío de formulario
# ─────────────────────────────────────────────

def enviar_formulario(registro, headless=False):
    driver = iniciar_driver(headless)

    try:
        driver.get(FORM_URL)

        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.NAME, "sgE-6972673-1-74"))
        )

        # Código
        codigo = "LIMVMJ02" if registro["Zona"] == "LIMA" else "SELVMJ"
        driver.find_element(By.NAME, "sgE-6972673-1-74").send_keys(codigo)

        # Datos personales
        driver.find_element(By.NAME, "sgE-6972673-1-50").send_keys(registro["Nombre"])
        driver.find_element(By.NAME, "sgE-6972673-1-51").send_keys(registro["Apellido"])

        # Zona / fecha
        if registro["Zona"] == "LIMA":
            driver.find_element(
                By.CSS_SELECTOR, 'label[for="sgE-6972673-1-77-10128"]'
            ).click()
            fecha = generar_fecha_lima()
        else:
            if registro["EsPrimerHijo"] == "SI":
                driver.find_element(
                    By.CSS_SELECTOR, 'label[for="sgE-6972673-1-77-10128"]'
                ).click()
            else:
                driver.find_element(
                    By.CSS_SELECTOR, 'label[for="sgE-6972673-1-77-10129"]'
                ).click()
            fecha = formatear_fecha_selva(registro["FechaNacimiento"])

        driver.find_element(By.NAME, "sgE-6972673-1-52").send_keys(fecha)

        # Sexo
        Select(
            driver.find_element(By.NAME, "sgE-6972673-1-76")
        ).select_by_value("10127")

        # Contacto
        correo = generar_correo(registro["Numero"])
        driver.find_element(By.NAME, "sgE-6972673-1-53").send_keys(correo)
        driver.find_element(By.NAME, "sgE-6972673-1-54").send_keys(registro["Numero"])

        # Departamento
        Select(
            driver.find_element(By.NAME, "sgE-6972673-1-64")
        ).select_by_visible_text(
            "Lima (departamento)" if registro["Zona"] == "LIMA" else "Amazonas"
        )

        # Checkboxes
        driver.find_element(
            By.CSS_SELECTOR, 'label[for="sgE-6972673-1-86-10139"]'
        ).click()
        driver.find_element(
            By.CSS_SELECTOR, 'label[for="sgE-6972673-1-86-10140"]'
        ).click()
        driver.find_element(
            By.CSS_SELECTOR, 'label[for="sgE-6972673-1-86-10141"]'
        ).click()

        # Submit robusto
        submit_btn = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.ID, "sg_SubmitButton"))
        )

        driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});",
            submit_btn
        )
        time.sleep(0.5)

        try:
            submit_btn.click()
        except Exception:
            driver.execute_script("arguments[0].click();", submit_btn)

        WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located(
                (By.XPATH, "//h2[contains(text(), 'Thank You!')]")
            )
        )

        return {"success": True}

    except Exception as e:
        try:
            os.makedirs("/app/screenshots", exist_ok=True)
            driver.save_screenshot(
                f"/app/screenshots/error_{int(time.time() * 1000)}.png"
            )
        except Exception:
            pass

        return {"success": False, "error": str(e)}

    finally:
        driver.quit()


# ─────────────────────────────────────────────
# Streaming
# ─────────────────────────────────────────────

async def procesar_excel_streaming(path, headless=False):
    registros = leer_excel(path)
    total = len(registros)

    yield json.dumps({"evento": "inicio", "total": total})

    for i, registro in enumerate(registros):
        yield json.dumps({
            "evento": "procesando",
            "index": i + 1,
            "nombre": f"{registro['Nombre']} {registro['Apellido']}"
        })

        resultado = await asyncio.to_thread(
            enviar_formulario, registro, headless
        )

        yield json.dumps({
            "evento": "resultado",
            "index": i + 1,
            "nombre": f"{registro['Nombre']} {registro['Apellido']}",
            **resultado
        })

        await asyncio.sleep(0.05)
