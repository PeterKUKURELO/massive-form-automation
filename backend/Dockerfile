FROM python:3.11-slim

# Instalar dependencias del sistema + Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libxkbcommon0 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    libxshmfence1 \
    libxdamage1 \
    libxrandr2 \
    libdrm2 \
    libxcomposite1 \
    libxfixes3 \
    libxext6 \
    libx11-6 \
    libxcb1 \
    libdbus-1-3 \
    libatspi2.0-0 \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
