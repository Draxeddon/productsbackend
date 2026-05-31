import User from '../models/user.models.js';
import Role from '../models/roles.models.js';
import dotenv from 'dotenv';

//Configuramos las variables de entorno
dotenv.config();

//Obtenemos el rol del usuario para la validación del administrador
const roleAdmin = process.env.SETUP_ROLE_ADMIN;

export const isAdmin = async (req,res,next)=>{
    try{
        const userFound = await User.findById(req.user.id);

        if(!userFound)//No se encontró el id en la bd
            return res.status(400)
                        .json({message:['No autorizado, usuario no encontrado']})
        //Obtenemos el rol para el usuario que inició sesión
        //Comprobamos que sea admin
        const role = await Role.findById(userFound.role);
        if(!role)//No se encuentra el role del usuario en la bd
            return res.status(400)
                        .json({message:['No autorizado, el rol para usuario no está definido']})

        //Si el rol del usuario pertenece a admin
        if(role.role != roleAdmin)
            return res.status(401)
                        .json({message: ['El usuario no está autorizado para esta operación']})
        //El usuario tiene un rol admin
        next();
    }catch(error) {
        return res.status(401)
                    .json({message: ['No autorizado para esta operación']});
    }
};//Fin de isAdmin