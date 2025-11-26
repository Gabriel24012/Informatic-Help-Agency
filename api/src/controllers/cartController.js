import Cart from '../models/cart.js';
import errorHandler from '../middlewares/errorHandler.js';

async function getCarts(req, res) {
  try {
    const carts = await Cart.find().populate('user').populate('products.product');
    res.json(carts);
  } catch (error) {
    next(error);
  }
}

async function getCartById(req, res) {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id).populate('user').populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function getCartByUser(req, res) {
  try {
    const userId = req.params.id;
    const cart = await Cart.findOne({ user: userId }).populate('user').populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'No cart found for this user' });
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function createCart(req, res) {
  try {
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each product must have product ID and quantity >= 1' });
      }
    }

    const newCart = await Cart.create({
      user,
      products
    });

    await newCart.populate('user');
    await newCart.populate('products.product');

    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
}

async function updateCart(req, res) {
  try {
    const { id } = req.params;
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each product must have product ID and quantity >= 1' });
      }
    }

    const updatedCart = await Cart.findByIdAndUpdate(id,
      { user, products },
      { new: true }
    ).populate('user').populate('products.product');

    if (updatedCart) {
      return res.status(200).json(updatedCart);
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    next(error);
  }
}

async function deleteCart(req, res) {
  try {
    const { id } = req.params;
    const deletedCart = await Cart.findByIdAndDelete(id);

    if (deletedCart) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function addProductToCart(req, res, next) {
  try {
    console.log('User from token:', req.user);
    const userId = req.user.userId; // <- viene del authMiddleware
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: 'Product ID and valid quantity are required' });
    }

    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Si no existe carrito, crear uno nuevo
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }]
      });
    } else {
      // Si existe carrito, verificar si el producto ya está
      const existingProductIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex >= 0) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate('user');
    await cart.populate('products.product');

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }

}

export {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
};