import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoConnection = {
    isConnected: 0
}

export const dbConnect = async () => {
    console.log(`mongourl: ${process.env.MONGODB_URI}`)
    if (mongoConnection.isConnected === 1) {
        console.log('MongoDB уже подключен')
        return;
    }
    if (mongoose.connections.length > 0) {
        mongoConnection.isConnected = mongoose.connections[0].readyState
        if (mongoConnection.isConnected === 1) {
            console.log('Подключение уже существует')
            return;
        }
        await mongoose.disconnect();
    }
    await mongoose.connect(process.env['MONGODB_URI'] ?? '', {
        dbName: process.env.MONGODB_NAME
    });
    mongoConnection.isConnected = 1
    console.log('mongodb успешно подключен')
}

export const dbDisconnect = async () => {
    if (mongoConnection.isConnected === 0) return;
    await mongoose.disconnect();
    mongoConnection.isConnected = 0
    console.log('mongodb успешно отключен')
}