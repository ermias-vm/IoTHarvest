# Servidor Nginx para IoTHarvest

Este documento describe la configuración del servidor Nginx que actúa como proxy inverso para la aplicación IoTHarvest, permitiendo exponer el frontend a internet de manera segura.

## Configuración implementada

La solución implementa:

1. **Proxy inverso con Nginx**: Todos los servicios ahora son accesibles a través de Nginx, que actúa como punto de entrada único.
2. **Enrutamiento de API**: Las solicitudes a `/api` son automáticamente enrutadas al backend.
3. **Archivos estáticos**: Las imágenes, CSS y JS tienen configuración de caché para mejorar el rendimiento.
4. **Preparado para HTTPS**: El archivo de configuración incluye secciones comentadas para habilitar SSL cuando sea necesario.

## Acceso a la aplicación

Después de ejecutar `./docker.sh start`, la aplicación estará disponible en:

- **Acceso local**: http://localhost
- **Acceso desde internet**: http://<tu-ip-pública> (si tu router tiene configurado el reenvío de puertos)

## Configurar acceso desde internet

Para acceder desde internet, necesitas:

1. **Configurar el reenvío de puertos en tu router**:
   - Reenviar el puerto 80 (HTTP) a la IP local del servidor donde se ejecuta IoTHarvest
   - Opcionalmente, reenviar el puerto 443 (HTTPS) si configuras SSL

2. **Consideraciones de seguridad**:
   - Se recomienda configurar HTTPS para conexiones desde internet
   - Usar un dominio con SSL para evitar transmitir credenciales en texto plano
   - Implementar medidas adicionales como restricción de IP o autenticación de doble factor

## Habilitar HTTPS

Para habilitar HTTPS, sigue estos pasos:

1. **Obtener certificados SSL**:
   ```bash
   # Crear directorio para certificados
   mkdir -p docker/ssl
   
   # Usando Let's Encrypt (requiere dominio público)
   # O generar certificados autofirmados:
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout docker/ssl/iotharvest.key -out docker/ssl/iotharvest.crt
   ```

2. **Editar docker-compose.yml**:
   - Descomentar la línea `- "443:443"` en el servicio nginx
   - Descomentar la línea `- ./ssl:/etc/nginx/ssl:ro`

3. **Editar nginx.conf**:
   - Descomentar la sección del servidor HTTPS
   - Actualizar `server_name` con tu dominio
   - Asegurarte de que los nombres de archivo de los certificados coincidan

4. **Reconstruir y reiniciar**:
   ```bash
   ./docker.sh build
   ./docker.sh restart
   ```

## Solución de problemas

Si tienes problemas con el acceso al servidor Nginx:

- **Comprobar logs**: `./docker.sh nginx` para ver los logs de Nginx
- **Verificar puertos**: `sudo netstat -tulpn | grep nginx` para comprobar si Nginx está escuchando
- **Problemas de certificados**: Verificar permisos y rutas en la carpeta `docker/ssl`

## Modificación de la configuración

El archivo de configuración de Nginx se encuentra en `docker/nginx.conf`. Después de modificarlo, reinicia el servicio:

```bash
./docker.sh restart
```

Para cambios más avanzados, puede ser necesario reconstruir la imagen:

```bash
./docker.sh build
```
