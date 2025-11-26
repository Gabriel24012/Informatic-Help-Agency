import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnection = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;
        const dbName = process.env.MONGODB_DB;

        await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB is connected en`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default dbConnection;