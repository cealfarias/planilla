# Usar una imagen oficial de Python ligera
FROM python:3.12-slim

# Evitar que Python genere archivos .pyc y forzar logs inmediatos
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Instalar las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Instalamos gunicorn explícitamente para producción
RUN pip install --no-cache-dir gunicorn

# Copiar el código fuente del proyecto
COPY . .

# Exponer el puerto en el que correrá la aplicación
EXPOSE 8000

# Comando para ejecutar la aplicación en producción con Gunicorn y Uvicorn
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
