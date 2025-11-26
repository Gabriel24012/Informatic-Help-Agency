import express from 'express';
import {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
} from '../controllers/cartController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

// Obtener todos los carritos (admin)
router.get('/cart', authMiddleware, isAdmin, getCarts);
// Obtener carrito por usuario
router.get('/cart/user/:id', authMiddleware, getCartByUser);

// Obtener carrito por ID
router.get('/cart/:id', authMiddleware, isAdmin, getCartById);



// Crear nuevo carrito
router.post('/cart', authMiddleware, createCart);

// Agregar producto al carrito (función especial)
router.post('/cart/add-product', authMiddleware, addProductToCart);

// Actualizar carrito completo
router.put('/cart/:id', authMiddleware, updateCart);

// Eliminar carrito
router.delete('/cart/:id', authMiddleware, deleteCart);

export default router;
