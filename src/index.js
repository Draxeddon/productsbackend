import app from './app.js';
import { connectDB } from './db.js';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

//Configuramos la lectura de las variables de entorno
//Para leer las variables de cloudinary
dotenv.config();

//Configuración de cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log("Servidor corriendo en el puerto " + PORT);