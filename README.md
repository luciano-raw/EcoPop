# EcoPop - Cinépolis Reciclaje Inteligente 🍿💚

EcoPop es un prototipo interactivo premium desarrollado con **Vite + React (TypeScript)** y **CSS Vanilla** para Cinépolis. Fomenta el reciclaje de vasos mediante la acreditación de eco-puntos tras el escaneo de códigos QR únicos impresos en los vasos. Estos puntos se acumulan y pueden ser canjeados por cupones de descuento, combos de comida o figuras coleccionables.

---

## 🚀 Cómo Iniciar el Proyecto Localmente

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

3. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📱 Cómo Funciona la Gestión de los Códigos QR

El sistema de códigos QR está completamente automatizado y funciona de la siguiente manera:

### 1. Estructura del Código QR
Cada vaso físico lleva impreso un código QR que contiene una URL dinámica. La estructura es:
```
https://tu-dominio.vercel.app/?code=ID-UNICO-DEL-VASO
```
*En desarrollo local, el sistema detecta automáticamente el puerto y genera enlaces tipo `http://localhost:5173/?code=ECO-CUP-001`.*

### 2. Generación de Códigos QR
1. Ve al **Admin Panel** desde el menú de navegación de la aplicación (o haz clic en el enlace del pie de página).
2. Escribe un ID personalizado (ej. `ECO-CUP-202`) o presiona el botón de **Generar ID Aleatorio** (icono de flechas de recarga).
3. Selecciona cuántos puntos otorgará este vaso (se recomiendan **100 puntos** por vaso para que con 2 escaneos alcancen los premios principales de 200 puntos).
4. Haz clic en **Crear y Activar Código**.
5. Se generará un código QR visual en pantalla. Puedes escanearlo con la cámara de tu teléfono móvil si estás corriendo el servidor en tu red local, o hacer clic en **"Simular Escaneo"** para probar el flujo de inmediato.

### 3. Flujo del Escaneo y Captura de Usuario
- **Caso 1: Usuario no identificado (Invitado)**
  Cuando una persona escanea el vaso por primera vez, el sistema detecta el código `?code=...` en la URL y despliega la pantalla de **Vaso Detectado**. Le muestra los puntos que va a ganar y le pide su **Nombre** y **Email** para registrarse en el **Club EcoPop**. Una vez registrado, los puntos se acreditan automáticamente en su sesión y se activa la gran celebración de confeti.
- **Caso 2: Usuario Identificado**
  Si el usuario ya inició sesión previamente en ese dispositivo, al escanear el QR la acreditación es **instantánea**. Se le suman los puntos, se lanza la animación de confeti y se le muestra su saldo actualizado.
- **Seguridad y Prevención de Fraude:**
  Una vez que un código QR ha sido reclamado, el sistema cambia su estado en la base de datos a `isActive: false`. Si alguien intenta escanear el mismo vaso por segunda vez, la web le mostrará una pantalla de advertencia explicando que *"Este vaso ya ha sido ingresado al contenedor de reciclaje"*.

---

## ⚡ Conexión con Supabase (Persistencia Real)

El proyecto incluye un cliente de base de datos modular en [src/services/db.ts](file:///c:/Users/Luciano/Desktop/Trabajo/Oficina/Desarrollo/qreciclaje/src/services/db.ts). 

### 1. Inicialización en Local (Sin configuración)
Por defecto, si no configuras nada, la aplicación almacena toda la información de usuarios, códigos de barra, puntos y cupones de forma transparente en el `localStorage` de tu navegador. Esto te permite testear el flujo, reiniciar la base de datos (con el botón del Panel Admin) y mostrar el demo sin necesidad de internet.

### 2. Conectar Supabase
Para persistir los datos de forma real entre múltiples dispositivos:

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve al editor SQL de Supabase y pega el contenido del archivo [supabase_schema.sql](file:///c:/Users/Luciano/Desktop/Trabajo/Oficina/Desarrollo/qreciclaje/supabase_schema.sql). Este script creará las tablas (`users`, `qr_codes`, `claimed_codes`, `user_coupons`) junto con las funciones y políticas de seguridad RLS necesarias.
3. Crea un archivo `.env` en la raíz de la carpeta `qreciclaje` con tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
   ```
4. El servicio `dbService` detectará automáticamente estas variables y cambiará de `localStorage` a Supabase de manera transparente.

---

## 🚀 Despliegue en Vercel

1. Sube tu repositorio de GitHub (que el usuario está creando).
2. Conecta el repositorio en Vercel.
3. Agrega las variables de entorno de Supabase (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`) en la configuración del proyecto en Vercel.
4. Vercel compilará automáticamente con `npm run build` y servirá el sitio web estático. ¡Listo para producción!
