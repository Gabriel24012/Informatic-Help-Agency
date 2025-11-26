import Category from "../models/category.js";
import errorHandler from "../middlewares/errorHandler.js";

async function getCategories(req, res, next) {
    try {
        const categories = await Category.find()
            .populate("parentCategory")
            .sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}
async function getCategoryById(req, res, next) {
    try {
        const category = await Category.findById(req.params.id).populate(
            "parentCategory"
        );
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
}
async function createCategory(req, res, next) {
    try {
        const { name, description, parentCategory, imageURL } = req.body;
        const newCategory = new Category({
            name,
            description,
            parentCategory: parentCategory || null,
            imageURL: imageURL || null,
        });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        next(error);
    }
}
async function updateCategory(req, res, next) {
    try {
        const { name, description, parentCategory, imageURL } = req.body;
        const idCategory = req.params.id;

        const updatedCategory = await Category.findByIdAndUpdate(
            idCategory,
            { name, description, parentCategory, imageURL },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        next(error);
    }
}
async function deleteCategory(req, res, next) {
    try {
        const idCategory = req.params.id;
        const deletedCategory = await Category.findByIdAndDelete(idCategory);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function searchCategories(req, res, next) {
    try {
        const { q, parentCategory, sort, order, limit = 10, page = 1 } = req.query;
        let filters = {};

        if (q) {
            filters.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ];
        }
        if (parentCategory) {
            filters.parentCategory = parentCategory;
        }

        let sortOptions = {};
        if (sort) {
            const sortOrder = order === "desc" ? -1 : 1;
            sortOptions[sort] = sortOrder;
        } else {
            sortOptions.name = -1;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const categories = await Category.find(filters)
            .populate("parentCategory")
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalResults = await Category.countDocuments(filters);
        const totalPages = Math.ceil(totalResults / parseInt(limit));

        res.status(200).json({
            categories,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalResults,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1,
            },
            filters: {
                searchTerm: q || null,
                parentCategory: parentCategory || null,
                sort: sort || "name",
                order: order || "desc",
            },
        });
    } catch (error) {
        next(error);
    }
}

export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories
};
