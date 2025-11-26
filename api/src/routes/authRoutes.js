import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import validate from '../middlewares/validation.js';
import { checkEmailAlreadyRegistered, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post(
    '/register',
    [
        body('displayName')
            .notEmpty().withMessage('Nombre de usuario es requerido')
            .isLength({ min: 2, max: 50 }).withMessage('Nombre de usuario debe tener entre 2 y 50 caracteres')
            .matches(/^[a-zA-Z0-9\s]+$/).withMessage('Nombre de usuario solo puede contener letras, números y espacios'),

        body('email')
            .notEmpty().withMessage('Email es requerido')
            .isEmail().withMessage('Email no válido')
            .matches(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/).withMessage('Email debe tener un dominio válido')
            .normalizeEmail(),

        body('password')
            .notEmpty().withMessage('Contraseña es requerida')
            .isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
            .matches(/\d/).withMessage('Contraseña debe contener al menos un número')
            .matches(/[a-zA-Z]/).withMessage('Contraseña debe contener al menos una letra'),

        body('phone')
            .notEmpty().withMessage('Teléfono es requerido')
            .isLength({ min: 10, max: 10 }).withMessage('Teléfono debe tener exactamente 10 dígitos')
            .isNumeric().withMessage('Teléfono solo puede contener números'),

        body('role')
            .optional()
            .isIn(['admin', 'customer', 'guest']).withMessage('Role debe ser admin, customer o guest'),
    ],
    validate,
    register
);

router.post('/login', [
    body('email')
        .notEmpty().withMessage('email is required')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
], validate, login);

router.get('/check-email', checkEmailAlreadyRegistered);

router.post('/refresh-token', refreshToken);

export default router;