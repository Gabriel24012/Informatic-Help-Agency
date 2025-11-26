import express from 'express';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import cartRoutes from './cartRoutes.js'


const router = express.Router();

router.use('/auth', authRoutes);
router.use(cartRoutes);
router.use(categoryRoutes);
router.use(productRoutes);
router.use(userRoutes)

export default router;