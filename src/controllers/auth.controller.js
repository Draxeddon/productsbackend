import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import Role from '../models/roles.models.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

//Configuramos las variables de entorno
dotenv.config();

//Obtenemos el rol del usuario para el registro
const roleUser = process.env.SETUP_ROLE_USER;

//Función para validar el token de inicio de sesión
export const verifyToken = async (req, res) =>{
    const { token } = req.cookies;
    if(!token)
        return res.status(400)
                    .json({message: ['No autorizado']});

    jwt.verify(token, TOKEN_SECRET, async (err, user)=>{
        if(err) //Hay error al validar el token
            return res.status(401)
                        .json({message: ['No autorizado']});
        const userFound = await User.findById(user.id);
        if(!userFound) //Si no se encuentra el usuario que viene en el token en la bd
            return res.status(401)
                        .json({message: ['No autorizado, Usuario no encontrado']});
        //Validar el rol del usuario
        const role = await Role.findById(userFound.role);
        if(!role) //No se encuentra el rol del usuario en la bd
            return res.status(401)
                        .json({message: ['No autorizado, el rol no está definido']});
        const userResponse = {
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: role.role
        };
        return res.json(userResponse);
    })
};//Fin de verifyToken

//Objeto request = req <-- Recibe las peticiones de los clientes
//Objeto response = res <-- Envia la respuesta del backend al cliente

//Función para registrar usuarios
export const register = async(req, res) => {
    try {
        const { username, email, password } = req.body;

        //Validar que el email no esté registrado en la bd
        const userFound = await User.findOne({email});
        if(userFound) //Ya se encuentra este email en la bd
            return res.status(400) //Retornamos error en el registro
                    .json({message: ['El email ya está registrado']})

        const passwordHash = await bcrypt.hash(password, 10);
        
        //Obtenemos el rol para los usuarios
        // Y lo agregamos para guardarlo en la bd con ese rol
        const role = await Role.findOne({role: roleUser});
        if(!role){//No se encuentra el rol de usuarios inicializado
            return res.status(400)//Retornamos error en el registro
                        .json({message: ['El rol para usuarios no está definido']})
        }
        const newUser = new User({
            username,
            email,
            password: passwordHash,
            role: role._id
        });
        //Insert into usuarios where values (username, email, password)
        const userSaved = await newUser.save();
        //console.log(newUser);

        //Generamos el token (cookie) de inicio de sesión
        const token = await createAccessToken({ id: userSaved._id });
        //res.cookie('token', token,);

        //Verificamos si el token de inicio de sesión lo generamos
        //para el entorno local o para el servidor en la nube
        if(process.env.ENVIROMENT == 'local'){
            //El entorno es desarrollo
            res.cookie('token',token,{
                sameSite: 'lax', //Para que el back y el front estén locales
            });
        }else{//El back y el front se encuentran en distintos servidores
            //Tienen que compartir la cookie
            res.cookie('token', token,{
                sameSite: 'none', //Para peticiones remotas
                secure: true, //Para activar https en deployment
            });
        }; //Fin de if(process.env)

        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            role: userSaved.role
        });
    } catch (error) {
        console.log(error);
        res.status(400)
            .json({message: ['Error al registrar usuario']});
    }
}

//Función para iniciar sesión
export const login = async (req, res) => {
    const {email, password} = req.body;
    console.log('email: ', email);
    console.log('password: ', password);
    try{
        //Buscamos el usuario mediante email en la bd
        const userFound = await User.findOne({email});
        console.log('userFound: ', userFound);
        if(!userFound) //Si no se encuentra el usuario
            return res.status(400)
                .json({message: ['Usuario no encontrado']});
        //Si se encuentra, comparamos la contraseña que envió el usuario con el de la db
        const isMatch = await bcrypt.compare(password, userFound.password);
        if(!isMatch) //No coincide la contraseña
            return res.status(400)
                .json({message: ['La Contraseña no coincide']});
        //Existe el usuario en la bd y el password es correcto
        //Generamos el token de inicio de sesión y retornamos los datos del usuario
        const token = await createAccessToken({id: userFound._id});

        if(process.env.ENVIROMENT == 'local'){
            res.cookie('token',token,{
                sameSite: 'lax',
            });
        }else{
            res.cookie('token', token,{
                sameSite: 'none',
                secure: true,
            });
        }; //Fin de if(process.env)
        //Obtenemos el rol para el usuario que inició sesión
        //y lo asignamos en el return del usuario
        const role = await Role.findById(userFound.role);
        if(!role) //No se encuentra el rol del usuario
            return res.status(400)
                        .json({message: ['Rol en login no encontrado']})

        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: role.role
        })
    }catch(error){
        console.log(error);
    }
}//Fin de Login

//Función para cerrar una sesión de usuario
export const logout = (req, res) => {
    res.cookie("token","", {
        expires: new Date(0)
    })
    return res.status(200)
                .json({message: ['Sesión Finalizada']});
}

//Función para visualizar el perfil del usuario
export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id);

    if(!userFound) //No se encontró el id en la bd
        return res.status(400)
                .json({message: ['Usuario no encontrado']});

    const role = await Role.findById(userFound.role);
    if(!role)
        return res.status(400).json({message: ['El rol para el usuario no está definido']});

    return res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        role: role.role
    })
};//Fin de profile