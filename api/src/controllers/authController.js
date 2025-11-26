import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Genera token de acceso
const generateToken = (userId, displayName, role) => {
    return jwt.sign(
        { userId, displayName, role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

// Genera refresh token
const generateRefreshToken = (userId) => {
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '15m' }
    );
    return { token: refreshToken, userId };
};

// Hashea la contraseña
const generatePassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Verifica si el usuario existe por correo
const checkUserExist = async (email) => {
    return await User.findOne({ email });
}

// Registro de usuario
async function register(req, res, next) {
    try {
        const { displayName, email, password, phone, dateOfBirth, avatar } = req.body;

        if (!displayName || !email || !password) {
            return res.status(422).json({ message: 'Datos incompletos' });
        }

        const emailNormalized = email.trim().toLowerCase();
        const userExist = await User.findOne({ email: emailNormalized });
        if (userExist) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashPassword = await generatePassword(password);

        const newUser = new User({
            displayName,
            email: emailNormalized,
            hashPassword,
            role: 'customer',
            phone,
            dateOfBirth,
            avatar
        });

        await newUser.save();

        res.status(201).json({ displayName, email: emailNormalized, phone });
    } catch (error) {
        console.error('Register error:', error);
        next(error);
    }
}

// Login de usuario
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const emailNormalized = email.trim().toLowerCase();
        const userExist = await checkUserExist(emailNormalized);

        if (!userExist) {
            return res.status(400).json({ message: 'User does not exist. You must sign up' });
        }

        const isMatch = await bcrypt.compare(password, userExist.hashPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(userExist._id, userExist.displayName, userExist.role);
        const refreshToken = generateRefreshToken(userExist._id);

        res.status(200).json({ token, refreshToken: refreshToken.token });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
}

// Verifica si un correo ya está registrado
const checkEmailAlreadyRegistered = async (req, res, next) => {
    try {
        const email = req.query.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        res.status(200).json({ exists: !!user });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ message: 'Server error while checking email' });
    }
}

// Refresh token
const refreshToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
            const newToken = generateToken(user._id, user.displayName, user.role);
            res.status(200).json({ token: newToken });
        } else {
            res.status(401).json({ message: 'Invalid refresh token' });
        }
    } catch (error) {
        console.error('Refresh token error:', error);
        next(error);
    }
};

export { register, login, checkEmailAlreadyRegistered, refreshToken };
