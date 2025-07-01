# Microservicio de Compras

## Descripción
Microservicio encargado de la gestión completa del proceso de compras, incluyendo carritos de compra y procesamiento de pedidos.

## Requisitos previos
- Node.js (v16+)
- MongoDB (v4.4+)
- Docker y Docker Compose (opcional, para ejecutar MongoDB)

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd purchasing-microservice

# Instalar dependencias
npm install
```

## Configuración de la base de datos
### MongoDB local
1. Instala MongoDB siguiendo las [instrucciones oficiales](https://www.mongodb.com/docs/manual/installation/)
2. Inicia el servicio de MongoDB:
   ```bash
   # En Linux/macOS
   sudo systemctl start mongod
   
   # En Windows (desde PowerShell como administrador)
   net start MongoDB
   ```
3. Verifica que MongoDB esté funcionando:
   ```bash
   mongo --eval "db.version()"
   ```

## Ejecución del proyecto

1. Modifica el archivo `src/app.module.ts` para asegurar que la conexión a MongoDB sea correcta:
   ```typescript
   MongooseModule.forRoot('mongodb://localhost:27017/purchasing-microservice')
   ```

2. Inicia el proyecto en modo desarrollo:
   ```bash
   npm run start:dev
   ```

3. Para producción:
   ```bash
   npm run build
   npm run start:prod
   ```

El servicio estará disponible en: http://localhost:3003/api/v1

## Documentación API
La documentación Swagger está disponible en:
```
http://localhost:3003/api/v1/docs
```

## Datos de prueba
El microservicio creará automáticamente estos datos de ejemplo:

### Carritos
| Usuario | Productos | Total |
|---------|-----------|-------|
| cliente@test.com | Hamburguesa Clásica (2), Refresco (1) | $21.97 |
| cliente2@test.com | Pizza Margarita (1) | $12.99 |

## Endpoints principales
- **Carritos**: `/cart`
- **Pedidos**: `/orders`

## Notas de uso
Este microservicio requiere el header `x-user-id` en las peticiones para identificar al usuario.

# -------------------------------------------------------------------------------

# Plataforma de Comercio Electrónico - Arquitectura de Microservicios (RESUMEN TODO EL PROYECTO)

## Descripción General

Este proyecto implementa una plataforma completa de comercio electrónico utilizando una arquitectura de microservicios. Cada componente está diseñado para funcionar de manera independiente, permitiendo escalabilidad, mantenimiento y desarrollo más eficientes.

## Arquitectura

![Arquitectura de Microservicios]

### Componentes Principales

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend (Next.js) | 3000 | Interfaz de usuario para clientes y tiendas |
| Microservicio de Usuarios | 3001 | Gestión de usuarios, autenticación y perfiles |
| Microservicio de Tienda | 3002 | Gestión de productos, pedidos y tiendas |

## Tecnologías Utilizadas

- **Frontend**: Next.js, React, TypeScript
- **Backend**: NestJS, TypeScript
- **Base de Datos**: MongoDB
- **Autenticación**: JWT
- **Comunicación**: REST API, TCP (microservicios)
- **Documentación API**: Swagger
- **Contenedores**: Docker (opcional)

## Microservicios

### 1. Frontend (insane)

Aplicación web construida con Next.js que proporciona la interfaz de usuario para todos los tipos de usuarios.

```bash
# Instalación
cd insane
npm install

# Ejecución
npm run dev
```

**Características principales:**
- Catálogo de productos
- Carrito de compras
- Gestión de pedidos
- Panel de administración para tiendas
- Autenticación de usuarios

### 2. Microservicio de Usuarios (microservicio-Usuario)

Gestiona la autenticación, registro y perfiles de usuarios.

```bash
# Instalación
cd microservicio-Usuario
npm install


# Ejecución
npm run start:dev
```

**Características principales:**
- Registro y autenticación de usuarios
- Gestión de perfiles
- Roles y permisos
- Recuperación de contraseña
- Comunicación por microservicios (TCP puerto 3001)

### 3. Microservicio de Tienda (store-microservice-f)

Gestiona productos, pedidos, proveedores y reseñas.

```bash
# Instalación
cd store-microservice-f
npm install

# Ejecución
npm run dev
```

**Características principales:**
- Gestión de productos
- Procesamiento de pedidos
- Gestión de proveedores
- Sistema de reseñas
- Panel de estadísticas

## Configuración de Base de Datos

Todos los microservicios utilizan MongoDB. Asegúrate de tener MongoDB instalado y ejecutándose


La base de datos predeterminada es `DbWeb` y se ejecuta en `localhost:27017`.

## Flujo de Comunicación

1. El cliente interactúa con el frontend (Next.js)
2. El frontend se comunica con los microservicios a través de API REST
3. Los microservicios se comunican entre sí mediante TCP cuando es necesario
4. Cada microservicio gestiona su propia conexión a la base de datos

## Endpoints Principales

### Microservicio de Usuarios (http://localhost:3000/api)
- **Autenticación**: `/auth/login`, `/auth/register`
- **Usuarios**: `/users`, `/users/:id`
- **Perfiles**: `/users/profile`

### Microservicio de Tienda (http://localhost:3002/api/store)
- **Productos**: `/products`, `/products/:id`
- **Pedidos**: `/orders`, `/orders/:id`
- **Proveedores**: `/suppliers`, `/suppliers/:id`
- **Reseñas**: `/reviews`, `/reviews/:id`
- **Dashboard**: `/dashboard`

## Desarrollo

### Requisitos Previos
- Node.js (v16+)
- MongoDB
- npm o yarn




