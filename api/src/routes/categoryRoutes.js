import express from "express";
import { query } from "express-validator";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories,
} from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";

const router = express.Router();
router.get(
    "/categories/search",
    [
        query("parentCategory")
            .optional()
            .isMongoId()
            .withMessage("formato invalido para el id de categoria"),
    ],
    searchCategories
);
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", authMiddleware, isAdmin, createCategory);
router.put("/categories/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/categories/:id", authMiddleware, isAdmin, deleteCategory);

export default router;
