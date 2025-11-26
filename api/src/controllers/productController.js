import Product from "../models/product.js";

async function getProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate("category")
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        const totalResults = await Product.countDocuments();
        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        next(error);
    }
}
async function getProductById(req, res) {
    try {
        const id = req.params.id;
        const product = await Product.findById(id).populate("category");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
}

async function getProductByCategory(req, res, next) {
    try {
        const idCategory = req.params.idCategory;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const products = await Product.find({ category: idCategory })
            .populate("category")
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });

        const totalResults = await Product.countDocuments({ category: idCategory });
        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
            category: idCategory,
        });
    } catch (error) {
        next(error);
    }
}

async function createProduct(req, res) {
    try {
        const { name, description, ficha, price, model, brand, category, imageURL, stock, offer, weight, code, documentation } = req.body;

        if (!name || !description || !price || !stock || !imageURL || !category || !ficha || !model || !brand || !offer || !weight || !code || !documentation) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newProduct = await Product.create({
            name, description, ficha, price, model, brand, category, imageURL, stock, offer, weight, code, documentation
        });
        res.status(201).json(newProduct);
    } catch (error) {
        next(error);
    }
}
async function updateProduct(req, res) {
    try {
        const id = req.params.id;
        const { name, description, price, stock, imageURL, category } = req.body;

        if (!name || !description || !price || !stock || !imageURL || !category) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { name, description, price, stock, imageURL, category },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
}
async function deleteProduct(req, res, next) {
    try {
        const id = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function searchProducts(req, res, next) {
    try {
        const {
            q,
            category,
            minPrice,
            maxPrice,
            inStock,
            sort,
            order,
            page = 1,
            limit = 10,
        } = req.query;

        let filters = {};

        if (q) {
            filters.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }

        if (category) {
            filters.category = category;
        }

        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = parseFloat(minPrice);
            if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
        }
        const bool = Boolean(inStock);
        if (inStock === "true") {
            filters.stock = { $gt: 0 };
        } else {
            filters.stock = { $gte: 0 };
        }

        let sortOptions = {};
        if (sort) {
            const sortOrder = order === "desc" ? -1 : 1;
            sortOptions[sort] = sortOrder;
        } else {
            sortOptions.createdAt = -1;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(filters)
            .populate("category")
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalResults = await Product.countDocuments(filters);
        const totalPages = Math.ceil(totalResults / parseInt(limit));

        res.status(200).json({
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalResults,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1,
            },
            filters: {
                searchTerm: q || null,
                category: category || null,
                priceRange: {
                    min: minPrice ? parseFloat(minPrice) : null,
                    max: maxPrice ? parseFloat(maxPrice) : null,
                },
                inStock: inStock === "true",
                sort: sort || "createdAt",
                order: order || "desc",
            },
        });
    } catch (error) {
        next(error);
    }
}

export {
    getProducts,
    searchProducts,
    getProductById,
    getProductByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
};
