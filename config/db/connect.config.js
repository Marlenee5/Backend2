import mongoose from 'mongoose'
import dotenv from 'dotenv';

dotenv.config();

const baseMongooseopts = {
    serverSelectionTimeoutMS: 10000,
}

export const connectMongoDB = async () => {
    try {
        const url = process.env.MONGO_URL;
        if (!url) throw new Error('MONGO_URL no está definida en las variables de entorno');
        await mongoose.connect(url, baseMongooseopts);
        console.log('😊Conectado a MongoDB de forma exitosa!')
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}

export const connectMongoAtlasDB = async () => {
    try {
        const url = process.env.MONGO_ATLAS_URL;
        if (!url) throw new Error('MONGO_ATLAS_URL no está definida en las variables de entorno');
        await mongoose.connect(url, baseMongooseopts);
        console.log('😊 Conectado a Mongo Atlas de forma exitosa!')
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}

export const connectAuto = async () => {
    const target = (process.env.MONGO_TARGET || 'local').toLowerCase();
    if (target === 'atlas') return connectMongoAtlasDB();
    return connectMongoDB();
}