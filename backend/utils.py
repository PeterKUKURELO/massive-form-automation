import random
from datetime import datetime
import pandas as pd

# Generar fecha aleatoria para Lima (2025, solo hasta hoy)
def generar_fecha_lima():
    hoy = datetime.now()
    while True:
        mes = random.randint(1, 12)
        dia = random.randint(1, 28)
        fecha = datetime(2025, mes, dia)
        if fecha <= hoy:
            return fecha.strftime('%m/%d/%Y')  # <-- cambio aquí al formato mm/dd/yyyy

# Formatear la fecha para SELVA
def formatear_fecha_selva(fecha_excel):
    if pd.isna(fecha_excel):
        return ''
    hoy = datetime.now()
    if fecha_excel > hoy:
        fecha_excel = hoy
    return fecha_excel.strftime('%m/%d/%Y')  # <-- aquí también el formato corregido

# Generar correo a partir del número
def generar_correo(numero):
    return f"{numero}@nogmail.com"
