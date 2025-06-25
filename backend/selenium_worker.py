import json
from excel_reader import leer_excel
from utils import generar_fecha_lima, formatear_fecha_selva, generar_correo
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException
import time
import asyncio

FORM_URL = 'https://survey.alchemer.com/s3/6972673/hospital-program-form'
CHROME_DRIVER_PATH = r"C:\Users\lenovo\Documents\CamilaProyecto\backend\chromeDriver\chromedriver.exe"

def iniciar_driver(headless=False):
    service = Service(CHROME_DRIVER_PATH)
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
    return webdriver.Chrome(service=service, options=options)

def enviar_formulario(registro, headless=False):
    driver = iniciar_driver(headless)
    driver.get(FORM_URL)
    time.sleep(2)
    try:
        if registro['Zona'] == 'LIMA':
            codigo = 'LIMVMJ02'
        else:
            codigo = 'SELVMJ'
        driver.find_element(By.NAME, 'sgE-6972673-1-74').send_keys(codigo)
        driver.find_element(By.NAME, 'sgE-6972673-1-50').send_keys(registro['Nombre'])
        driver.find_element(By.NAME, 'sgE-6972673-1-51').send_keys(registro['Apellido'])

        if registro['Zona'] == 'LIMA':
            driver.find_element(By.CSS_SELECTOR, 'label[for=\"sgE-6972673-1-77-10128\"]').click()
            fecha = generar_fecha_lima()
        else:
            if registro['EsPrimerHijo'] == 'SI':
                driver.find_element(By.CSS_SELECTOR, 'label[for=\"sgE-6972673-1-77-10128\"]').click()
            else:
                driver.find_element(By.CSS_SELECTOR, 'label[for=\"sgE-6972673-1-77-10129\"]').click()
            fecha = formatear_fecha_selva(registro['FechaNacimiento'])

        driver.find_element(By.NAME, 'sgE-6972673-1-52').send_keys(fecha)
        Select(driver.find_element(By.NAME, 'sgE-6972673-1-76')).select_by_value("10127")
        correo = generar_correo(registro['Numero'])
        driver.find_element(By.NAME, 'sgE-6972673-1-53').send_keys(correo)
        driver.find_element(By.NAME, 'sgE-6972673-1-54').send_keys(registro['Numero'])

        if registro['Zona'] == 'LIMA':
            Select(driver.find_element(By.NAME, 'sgE-6972673-1-64')).select_by_visible_text('Lima (departamento)')
        else:
            Select(driver.find_element(By.NAME, 'sgE-6972673-1-64')).select_by_visible_text('Amazonas')

        driver.find_element(By.CSS_SELECTOR, 'label[for=\"sgE-6972673-1-86-10139\"]').click()
        driver.find_element(By.CSS_SELECTOR, 'label[for=\"sgE-6972673-1-86-10140\"]').click()
        driver.find_element(By.CSS_SELECTOR, 'label[for=\"sgE-6972673-1-86-10141\"]').click()

        driver.find_element(By.ID, 'sg_SubmitButton').click()
        time.sleep(3)
        driver.find_element(By.XPATH, "//h2[contains(text(), 'Thank You!')]")
        driver.quit()
        return {"success": True}
    except Exception as e:
        driver.quit()
        return {"success": False, "error": str(e)}

async def procesar_excel_streaming(path, headless=False):
    registros = leer_excel(path)
    total = len(registros)
    yield json.dumps({"total": total})

    for i, registro in enumerate(registros):
        resultado = enviar_formulario(registro, headless)
        registro_resultado = {
            "index": i + 1,
            "nombre": f"{registro['Nombre']} {registro['Apellido']}",
            **resultado
        }
        yield json.dumps(registro_resultado)
        await asyncio.sleep(0.01)
