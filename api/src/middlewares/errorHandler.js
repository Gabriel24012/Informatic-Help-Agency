import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errorHandler = (err, req, res, next) => {
    const dateTime = new Date();
    const logFilePath = path.join(__dirname, '../../logs/error.log');
    const logMessage = `${dateTime.toISOString()} | ${req.method} ${req.url} | ${err.message} | ${err.stack}\n`;

    // Crear directorio si no existe
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFile(logFilePath, logMessage, (fsErr) => {
        if (fsErr) {
            console.error('Failed to write into log file:', fsErr);
        }
    });

    // No enviar respuesta si ya se envió
    if (!res.headersSent) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }

};

export default errorHandler;