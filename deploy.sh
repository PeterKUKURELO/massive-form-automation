#!/bin/bash

echo "🚀 Iniciando despliegue de Form Automation..."

# Detener contenedores existentes
echo "📦 Deteniendo contenedores existentes..."
docker-compose down

# Construir imágenes
echo "🔨 Construyendo imágenes..."
docker-compose build --no-cache

# Levantar servicios
echo "🚀 Levantando servicios..."
docker-compose up -d

# Mostrar estado
echo "📊 Estado de los servicios:"
docker-compose ps

echo "✅ Despliegue completado!"
echo "🌐 La aplicación está disponible en: http://localhost"