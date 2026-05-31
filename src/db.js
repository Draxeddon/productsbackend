import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const url = process.env.MONGODB_URL;
        await mongoose.connect(url);
        console.log("Base de datos conectada " + url);
    }catch (error) {
        console.log(error);
    }
}