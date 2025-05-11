# Estructura de la carpeta `data/`

La carpeta `backend/data/` contiene toda la información persistente y auxiliar del sistema IoT Harvest.  
A continuación se muestra la estructura de subcarpetas y archivos, seguida de una breve explicación de cada una.

## Estructura gráfica

```
data/
├── cache/
│   ├── imageCache/           # Imágenes cacheadas (últimas imágenes recibidas)
│   └── sensorCache.json      # Caché de los últimos datos de sensores
├── images/                   # Todas las imágenes originales recibidas
├── mail/                     # Plantillas y recursos para los correos de alerta
├── sensors/                  # Archivos JSON con los datos históricos de sensores (un archivo por día)
├── test/
│   ├── downloadImages/       # Imágenes descargadas desde Cloudinary para pruebas
│   ├── testImages/           # Imágenes de prueba para envío automático
│   └── testSensors/          # Datos reales de sensores
└── README.md                 # Este archivo de documentación
```

## Descripción de cada carpeta

- **cache/**  
    - **imageCache/**: Carpeta donde se almacenan las últimas imágenes recibidas para acceso rápido y visualización en el dashboard.  
    - **sensorCache.json**: Archivo JSON que contiene los últimos datos de sensores recibidos, usado para respuestas rápidas y evitar consultas a la base de datos.

- **images/**  
    Carpeta donde se guardan todas las imágenes originales recibidas del sistema (ESP32 o scripts). Sirve como histórico completo de imágenes.

- **mail/**  
    Contiene las plantillas de texto para los diferentes tipos de alertas que se envían por correo electrónico, así como imágenes o recursos usados en los mails.

- **sensors/**  
  Aquí se almacenan los archivos JSON con los datos históricos de sensores.  
  Cada día se crea un archivo con nombre `YYYY-MM-DD.json` que contiene todos los datos recibidos ese día.

- **test/**  
  Carpeta auxiliar para pruebas y desarrollo:
  - **downloadImages/**: Imágenes descargadas desde Cloudinary mediante scripts o endpoints de administración.
  - **testImages/**: Imágenes de prueba para automatizar el envío de imágenes al servidor.
  - **testSensors/**: Archivos JSON con datos reales de los sensores.


---