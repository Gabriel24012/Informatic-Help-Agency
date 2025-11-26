import express from 'express';
import dotenv from 'dotenv';
import routes from './src/routes/index.js';
import dbConnection from './src/config/database.js';
import logger from './src/middlewares/logger.js';
import errorHandler from './src/middlewares/errorHandler.js';
import setupGlobalErrorHandlers from './src/middlewares/globalErrorHandler.js';
import cors from 'cors';
import initializeData from './src/config/initializeData.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

setupGlobalErrorHandlers();

const app = express();
dbConnection();
console.log("CORS ORIGIN:", process.env.FRONT_APP_URL);
app.use(
    cors({
        origin: process.env.FRONT_APP_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
        optionsSuccessStatus: 200,
    })
);
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
    res.send('WELCOME!');
});

app.use('/api', routes);

app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        method: req.method,
        url: req.originalUrl
    });
});

if (process.env.INITIAL_DATA === "development") {
    console.log("Development environment, creating mocking data...");
    initializeData();
}

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
