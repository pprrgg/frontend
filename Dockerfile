# calculadoradeahorroenergetico_f/Dockerfile
FROM node:18

# Definimos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos del proyecto al contenedor
COPY package*.json ./

# Instalamos las dependencias del proyecto
RUN npm install

# Copiamos el código fuente al contenedor
COPY . .

# Construimos la aplicación para producción
RUN npm run build

# Exponemos el puerto en el que Vite correrá
EXPOSE 3000

# Iniciamos el servidor de desarrollo
CMD ["npm", "run", "dev"]


# docker build -t app_react .
# docker run -p 3000:3000 app_react

# docker save -o app_calculadoradeahorroenergetico_f.tar app_calculadoradeahorroenergetico_f:latest
# docker load -i app_calculadoradeahorroenergetico_f.tar
