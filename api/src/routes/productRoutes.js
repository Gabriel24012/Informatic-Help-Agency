import express from 'express';
import { query } from 'express-validator'
import {
    getProducts,
    getProductById,
    getProductByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts

} from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validation.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/search', [
    query('minPrice').optional().isNumeric({ min: 0 }).withMessage('este campo debbe ser un numero positivo'),
    query('maxPrice').optional().isNumeric({ min: 1 }).withMessage('este campo debe ser un numero '),
    query('page').optional().isInt({ min: 1 }).withMessage('este campo debe ser un numero positivo'),
    query('limit').optional().isInt({ min: 1 }).withMessage('este campo debe ser un numero positivo'),
], validate, searchProducts);

router.get('/products/category/:idCategory', getProductByCategory);
router.get('/products/:id', getProductById);
router.post('/products', authMiddleware, isAdmin, createProduct);
router.put('/products/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/products/:id', authMiddleware, isAdmin, deleteProduct);


export default router;