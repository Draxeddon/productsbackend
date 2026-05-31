import Role from '../models/roles.models.js';
import User from '../models/user.models.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../db.js';

export const initializeSetup = async() => {
    try{
        //Configuramos la lectura de variables de entorno
        dotenv.config();

        //Nos conectamos a la bd
        connectDB();

        const roleAdmin = process.env.SETUP_ROLE_ADMIN;
        const roleUser = process.env.SETUP_ROLE_USER;

        //Buscamos si existen los roles creados en la bd
        const countRoles = await Role.estimatedDocumentCount();

        //Si countRoles es cero significa que no hay roles creados
        if(countRoles == 0){
            //Hay que crear los roles en la bd
            console.log("Creando Roles");
            await Promise.all([
                new Role ( {role: roleUser} ).save(),
                new Role ( {role: roleAdmin} ).save()
            ]);
        }//Fin de if(countRole)

        //Importamos los datos del usuario administrador definidos en .env
        const setupAdminUsername = process.env.SETUP_ADMIN_USERNAME;
        const setupPwd = process.env.SETUP_ADMIN_PWD;
        const setupEmail = process.env.SETUP_ADMIN_EMAIL;

        //Buscamos si existe el usuario admin
        const userAdmin = await User.findOne({username: setupAdminUsername});
        if(userAdmin == null){
            //No existe un usuario administrador
            //Se crea el usuario admin tomando las variables de ambiente
            console.log("Creando usuario Admin");
            const roleAdminDB = await Role.findOne({role: roleAdmin});
            const passwordAdmin = await bcryptjs.hash(setupPwd, 10);
            const newUserAdmin = new User ({
                username: setupAdminUsername,
                email: setupEmail,
                password: passwordAdmin,
                role: roleAdminDB
            });
            await newUserAdmin.save();
            console.log("Roles y usuarios inicializados")
        }//Fin de if(userAdmin==null)

    }catch(error){
        console.log(error);
        console.log("Error a inicializar los roles de usuario");
    }
};//Fin de initializeSetup

initializeSetup();