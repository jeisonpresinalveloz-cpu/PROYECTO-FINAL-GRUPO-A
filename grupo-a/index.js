const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'nombres.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de nombres.');
        }
        
    
        const nombres = data.split('\n').filter(nombre => nombre.trim() !== '');
        
        res.json({
            mensaje: "Nombres de los integrantes del GRUPO-A",
            nombres: nombres
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor de Express ejecutándose en http://localhost:${PORT}`);
});