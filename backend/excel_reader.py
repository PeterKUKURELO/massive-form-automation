import pandas as pd

def leer_excel(ruta):
    df = pd.read_excel(ruta)
    registros = []

    for _, row in df.iterrows():
        registro = {
            'Nombre': row['Nombre'].strip(),
            'Apellido': row['Apellido'].strip(),
            'Numero': str(row['Número Celular']).strip(),
            'Zona': row['Zona'].strip().upper(),
            'EsPrimerHijo': row['Es Primer Hijo'].strip().capitalize(),
            'FechaNacimiento': row['Fecha de Nacimiento']
        }
        registros.append(registro)

    return registros
