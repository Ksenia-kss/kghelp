FROM python:3.9-alpine

WORKDIR /app

COPY index.html .
COPY script.js .
COPY style.css .
COPY scratches/ ./scratches/

EXPOSE 8000
CMD ["python", "-m", "http.server", "8000"]