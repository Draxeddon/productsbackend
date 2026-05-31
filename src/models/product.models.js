import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            default: 0.0,
            required: true
        },
        quantity: {
            type: Number,
            default: 0,
            required: true
        },
        image: {
            type: String, //URL de la imagen de cloudinary
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }

    }
); //Fin de productSchema

export default mongoose.model('Product', productSchema);