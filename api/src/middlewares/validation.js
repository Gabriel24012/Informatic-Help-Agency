import { validationResult } from 'express-validator';

export default function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Mando los errores completos al frontend
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
}
