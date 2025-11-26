import bcrypt from "bcrypt";
import User from "../models/user.js";

// Obtener perfil del usuario autenticado
const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId; // Asumiendo que tienes middleware de autenticación

        const user = await User.findById(userId).select("-hashPassword");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User profile retrieved successfully",
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, isActive } = req.query;

        // Construir filtro
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const users = await User.find(filter)
            .select("-hashPassword")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ _id: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            message: "Users retrieved successfully",
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error) {
        next(error);
    }
};

// Obtener usuario por ID (solo admin)
const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("-hashPassword");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Actualizar perfil del usuario
const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { displayName, email, phone, avatar } = req.body;

        // Verificar si el email ya existe (si se está cambiando)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Actualizar campos
        if (displayName) user.displayName = displayName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;

        await user.save();

        // Devolver usuario sin password
        const updatedUser = await User.findById(userId).select("-hashPassword");

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

// Cambiar contraseña
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verificar contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.hashPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash nueva contraseña
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        user.hashPassword = hashedNewPassword;
        await user.save();

        res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Actualizar usuario (solo admin)
const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { displayName, email, phone, avatar, role, isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verificar si el email ya existe (si se está cambiando)
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Actualizar campos
        if (displayName) user.displayName = displayName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        const updatedUser = await User.findById(userId).select("-hashPassword");

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

// Desactivar usuario
const deactivateUser = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({
            message: "Account deactivated successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Activar/Desactivar usuario (solo admin)
const toggleUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        const updatedUser = await User.findById(userId).select("-hashPassword");

        res.status(200).json({
            message: `User ${user.isActive ? "activated" : "deactivated"
                } successfully`,
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

// Eliminar cuenta (soft delete)
const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Soft delete - solo desactivar
        user.isActive = false;
        await user.save();

        res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const searchUsers = async (req, res, next) => {
    try {
        const { q, role, isActive, sort, order, page = 1, limit = 10 } = req.query;

        let filters = {};

        if (q) {
            filters.$or = [
                { displayName: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { phone: { $regex: q } },
            ];
        }
        //http://localhost:3000/api/users/search?q=Espe
        if (role) {
            filters.role = role;
        }
        if (isActive === "true") {
            filters.isActive = true;
        } else if (isActive === "false") {
            filters.isActive = false;
        }

        let sortOptions = {};
        if (sort) {
            const sortOrder = order === "desc" ? -1 : 1;
            sortOptions[sort] = sortOrder;
        } else {
            sortOptions.email = -1;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(filters)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalResults = await User.countDocuments(filters);
        const totalPages = Math.ceil(totalResults / parseInt(limit));

        res.status(200).json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalResults,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1,
            },
            filters: {
                searchTerm: q || null,
                role: role || null,
                isActive,
                sort: sort || "email",
                order: order || "desc",
            },
        });
    } catch (error) {
        next(error);
    }
};

export {
    getUserProfile,
    getAllUsers,
    getUserById,
    updateUserProfile,
    changePassword,
    updateUser,
    deactivateUser,
    toggleUserStatus,
    deleteUser,
    searchUsers
};
