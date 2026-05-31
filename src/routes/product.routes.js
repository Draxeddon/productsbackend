import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
    getProducts,
    createProduct,
    getProduct,
    deleteProduct,
    updateProductWithoutImage,
    updateProductWithImage,
    getAllProducts
} from '../controllers/product.controller.js';

//Importamos el validatorSchema
import { validateSchema } from '../middlewares/validateSchema.js';

//Importamos el esquema de productos para validación
import { productSchema, productUpdateSchema } from '../schemas/product.schemas.js';

//Importamos el middleware para subir imagenes al cloudinary
import { uploadToCloudinary } from '../middlewares/uploadImage.js';

import { isAdmin } from '../middlewares/isAdmin.js';

import { validateId } from '../middlewares/validateId.js';

const router = Router();

//Ruta para obtener todos los productos para la compra
router.get('/products/getallproducts', getAllProducts);

//Ruta para obtener todos los productos
router.get('/products', authRequired, isAdmin, getProducts);

//Ruta para agregar productos
router.post('/products', authRequired, isAdmin, uploadToCloudinary, validateSchema(productSchema), createProduct);

//Ruta para obtener un producto por id
router.get('/products/:id', authRequired, isAdmin, validateId, getProduct);

//Ruta para eliminar un producto
router.delete('/products/:id', authRequired, isAdmin, validateId, deleteProduct);

//Ruta para actualizar un producto por id SIN CAMBIAR LA IMAGEN
router.put('/products/:id', authRequired, isAdmin, validateId, validateSchema(productUpdateSchema), updateProductWithoutImage);

//Ruta para actualizar un producto por id CON CAMBIAR LA IMAGEN
router.put('/products/updatewithimage/:id', authRequired, isAdmin, validateId, uploadToCloudinary, validateSchema(productSchema), updateProductWithImage);

export default router;