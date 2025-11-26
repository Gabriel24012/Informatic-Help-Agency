import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    ficha: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 1,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    imageURL: {
        type: [String],
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    offer: {
        type: Number,
        max: 100,
        min: 0,
        default: 0,
    },
    weight: {
        type: Number,
    },
    code: {
        type: String,
        trim: true,
    },
    documentation: {
        type: [String], // URLs or paths to uploaded documents
    },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
