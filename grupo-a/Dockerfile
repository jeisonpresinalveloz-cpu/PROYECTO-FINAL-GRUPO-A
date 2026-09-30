FROM node:24


WORKDIR /app

# 3. Copiar primero los archivos de dependencias para aprovechar el caché de Docker
COPY package*.json ./

# 4. Instalar las dependencias (Express)
RUN npm install

# 5. Copiar el resto del código (incluyendo index.js y nombres.txt)
COPY . .

# 6. Exponer el puerto que usa nuestra app de Express
EXPOSE 3000

# 7. Comando principal para arrancar la aplicación
CMD ["node", "index.js"]