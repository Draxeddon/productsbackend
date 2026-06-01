import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { sanitizeMongoInput } from 'express-v5-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

//Configuramos la lectura de variables de ambiente
//para leer la variable de ambiente del BACKEND
dotenv.config();

console.log('Backend ', process.env.BASE_URL_BACKEND);

//Importamos las rutas para usuarios
import authRoutes from './routes/auth.routes.js';
//Importamos las rutas para productos
import productRoutes from './routes/product.routes.js';
//Importamos las rutas para órdenes
import orderRoutes from './routes/order.routes.js';

const app = express();

//Denegar cualquier tipo de framing
app.use( (req, res, next)=>{
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

app.use(cors({
    origin: [process.env.BASE_URL_BACKEND, process.env.BASE_URL_FRONTEND],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials:true,
}));
app.options('*', cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(sanitizeMongoInput);
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

//Configuraciones estrictas para prevenir scans
const scanLimitier = rateLimit({
    windowMs: 15 * 60 * 1000, //15 min
    max: 100,                 //Máximo de 100 peticiones por ventana
    message: { error: ['Demasiadas peticiones, intente más tarde']},
    standardHeaders: true,
    legacyHeaders: false,
    //Bloquea la Ip que excedan el límite
    skip: (req) => false, //No saltar ninguna petición
})

app.use(scanLimitier);

//Indicamos al servidor que utilice las rutas del objeto autRoutes
app.use('/api/', authRoutes);
app.use('/api/', productRoutes);
app.use('/api/', orderRoutes);
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenido al API REST de Productos",
    version: "1.0.0",
    rutasDisponibles: [
      {endpoint: "/api/register", method: "POST", description: "Registrar un nuevo usuario"},
      {endpoint: "/api/login", method: "POST", description: "Iniciar sesion"},
      {endpoint: "/", method: "GET", description: "Ruta incial de la aplicacion"},
    ]
  });
}); //fin de app.get /

//healt check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ProductosApp API se esta ejecutando correctamente'
  });
});

//manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

export default app;