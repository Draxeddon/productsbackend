import multer from 'multer';
import cloudinary from 'cloudinary';

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5*1024*1024, //5MB
    }
}).single('image')//Image es el nombre del atributo que viene en req

//Función para subir la imagen de memoria a cloudinary
export const uploadToCloudinary = async (req, res, next) => {
    const allowedMimes = ['image/jpeg', 'image/jpg','image/png', 'image/webp']
    try {
        upload(req, res, async (err) => {
            if (err){
                if(err.code=='LIMIT_FILE_SIZE')
                    return res.status(400)
                                .json({message: ['Tamaño del archivo excedido']})
                else
                    return res.status(400)
                                .json({message:['Error al subir la imagen']})
            }//Fin de if(err)
            if(!req.file)
                return res.status(400)
                            .json({message: ['No se encontró la imagen']})
            if(!allowedMimes.includes(req.file.mimetype)){
                return res.status(400)
                            .json({message: ["Formato de imagen incorrecto"]})
            }
            //Obtemnemos los datos de la imagen del producto almacenada en memoria req.file
            const image = req.file;

            //Convertimos el objeto de la imagen a un objeto base64 para poderlo 
            //subir a cloudinary como imagen
            const base64Image = Buffer.from(image.buffer).toString("base64");
            const dataUri = "data:" + image.mimetype + ";base64," + base64Image;
            //Subir la imagen a cloudinary
            const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);
            req.urlImage = uploadResponse.secure_url;
            next();
        })//Fin del upload
    }catch(error){
        return res.status(400)
                    .json({message: [error.message]})
    }//Fin del try catch
};//Fin de uploadToCloudinary