import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupGlobalErrorHandlers = () => {
    const logFilePath = path.join(__dirname, '../../logs/error.log');

    // Crear directorio si no existe
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    process.on('uncaughtException', (error) => {
        const datetime = new Date();
        const logMessage = `${datetime.toISOString()} | UNCAUGHT EXCEPTION | ${error.message} | ${error.stack}\n`;
        fs.appendFileSync(logFilePath, logMessage);
        console.log('Uncaught exception logged, server continues...');
    });

    process.on('unhandledRejection', (reason, promise) => {
        const datetime = new Date();
        const logMessage = `${datetime.toISOString()} | UNHANDLED EXCEPTION | ${reason} | ${promise}\n`;
        fs.appendFileSync(logFilePath, logMessage);
        console.log('Unhandled rejection logged, server continues...');
    });
};

export default setupGlobalErrorHandlers;