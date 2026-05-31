import { TOKEN_SECRET } from "../config.js";
import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
    //Obtenemos las cookies de inicio de sesión
    console.log(req.cookies);
    const { token } = req.cookies;
    if (!token)//Si no hay token en las cookies
        return res.status(401)
            .json({message: ['No token, autorización denegada']});
    //Verificamos que el token sea válido
    jwt.verify(token, TOKEN_SECRET, (err, user) => {
        if(err) //Si hay error al validar el token
            return res.status(403)
                .json({message: ['Token no válido']});

        //Si no hay error en el token, imprimimos el usuario
        //que inició sesión
        req.user = user;
        next();
    });
}

//req <--- Recibir datos del cliente (Navegador o Postman)
//res <--- Para responder con datos al Navegador o Postman
//next <--- Indica que existe otra función siguiente por ejecutar
/*
    Si el middleware se ejecuta correctamente, al final
    se manda llamar la función next

    Si hay algún error en el middleware ahí se detiene la ejecución
*/
