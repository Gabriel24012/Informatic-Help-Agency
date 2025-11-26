import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        
    },
    hashPassword: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'customer', 'guest'],
        default: 'guest'
    },
    avatar: {
        type: String,
        required: true,
        default: 'https://placehold.co/100x100.png',
    },
    phone: {
        type: String,
        required: true,
        max: 10,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const User = mongoose.model('User', userSchema);

export default User;