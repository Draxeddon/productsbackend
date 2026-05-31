import { Router } from "express";
import { login, register, logout, profile, verifyToken } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

//Importamos el validatorSchema
import { validateSchema } from "../middlewares/validateSchema.js";

//Importamos los schemas de validación
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";

//Router redirecciona a la función de la ruta solicitada
const router = Router();

//Ruta para validar el token
router.get('/verify', verifyToken);
    
//Registro de usuarios
router.post("/register", validateSchema(registerSchema), register);

//Inicio de sesión
router.post("/login", validateSchema(loginSchema), login);

//Cerrar la sesión
router.post("/logout", logout);

//Visualizar el perfil
router.get("/profile", authRequired, profile);

export default router;