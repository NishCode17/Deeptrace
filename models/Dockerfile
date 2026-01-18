FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for OpenCV/Image processing
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create a writable directory for temp files (Hugging Face requirement)
RUN mkdir -p /app/temp && chmod 777 /app/temp

# Set permissions for the application directory
RUN chmod -R 777 /app

# Expose the port Hugging Face expects (7860)
EXPOSE 7860

# Run the application
CMD ["python", "app.py"]
