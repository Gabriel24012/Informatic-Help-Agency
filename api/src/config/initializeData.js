import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import User from "../models/user.js";
import Category from "../models/category.js";
import Product from "../models/product.js";

async function generateUsers() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const defaultUsers = [
                {
                    displayName: "Admin User",
                    userName: "admin",
                    email: "admin@ecommerce.com",
                    hashPassword: await bcrypt.hash("adminpassword", 10),
                    role: "admin",
                    avatar: faker.image.avatar(),
                    phone: "4491985370",
                    dateOfBirth: "2004-10-07",
                    isActive: true,
                },
                {
                    displayName: "Customer",
                    userName: "Customer",
                    email: "customer@ecommerce.com",
                    hashPassword: await bcrypt.hash("customerpassword", 10),
                    role: "customer",
                    avatar: faker.image.avatar(),
                    phone: "5555555555",
                    dateOfBirth: "2000-10-10",
                    isActive: true,
                },
            ];
            await User.insertMany(defaultUsers);
            console.log("Default users created");
        } else {
            console.log("Users already exist in the database");
        }
    } catch (error) {
        console.error("Error initializing data:", error);
        process.exit(1);
    }
}

async function generateCategories() {
    try {
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const mainCategories = [
                {
                    name: "Control De Asistencia",
                    description: "Características físicas innatas y únicas de una persona. ",
                },
                {
                    name: "Control de Acceso",
                    description: "Gadgets modernos y útiles para el día a día",
                },
                {
                    name: "Accesorios",
                    description: "Se basa en las acciones y comportamientos únicos de un individuo. ",
                },
            ];

            const createdMainCategories = await Category.insertMany(
                mainCategories.map((category) => ({
                    ...category,
                    imageURL: faker.image.url({ width: 640, height: 480, category: "technology" }),
                }))
            );
        } else {
            console.log("Categories already exist in the database");
        }
    } catch (error) {
        console.error("Error creating categories:", error);
    }
}

async function generateProducts() {
    try {
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            const categories = await Category.find();

            if (categories.length === 0) {
                console.log("No categories found. Please generate categories first.");
                return;
            }
            const products = [
                {
                    name: "Lector Biométrico X100",
                    description: "Lector de huella dactilar de alta precisión.",
                    ficha: "Ficha prueba",
                    price: 299.99,
                    model: "Modelo Prueba",
                    brand: "Marca Prueba",
                    category: categories[0]._id,
                    imageURL: "/uploads/lector.jpg",
                    stock: 20,
                    offer: 50,
                    weight: 100,
                    code: 12343567,
                    documentation: ["hola", "Documentacion Prueba"]
                },
                {
                    name: "Sensor de Iris I200",
                    description: "Escáner de iris con reconocimiento rápido.",
                    ficha: "Ficha prueba",
                    price: 30029.99,
                    model: "Modelo Prueba",
                    brand: "Marca Prueba",
                    category: categories[1]._id,
                    imageURL: "/uploads/sensor.jpg",
                    stock: 18,
                    offer: 10,
                    weight: 200,
                    code: 12243567,
                    documentation: ["hola", "Documentacion Prueba"]
                },
                {
                    name: "K30 - ZKTeco",
                    description: "Teclado con sensor de huella integrado.",
                    ficha: "Ficha prueba",
                    price: 5009.99,
                    model: "Modelo Prueba",
                    brand: "Marca Prueba",
                    category: categories[2]._id,
                    imageURL: "/uploads/k30.jpg",
                    stock: 20,
                    offer: 50,
                    weight: 100,
                    code: 12343567,
                    documentation: ["hola", "Documentacion Prueba"]
                },
                {
                    name: "Cámara de Reconocimiento Facial F400",
                    description: "Cámara de seguridad con reconocimiento facial.",
                    ficha: "Ficha prueba",
                    price: 299.99,
                    model: "Modelo Prueba",
                    brand: "Marca Prueba",
                    category: categories[0]._id,
                    imageURL: "/uploads/camara.png",
                    stock: 20,
                    offer: 50,
                    weight: 100,
                    code: 12343567,
                    documentation: ["hola", "Documentacion Prueba"]
                },
                {
                    name: "F22/ID/ADMS",
                    description: "Cámara de seguridad con reconocimiento facial.",
                    ficha: "Ficha prueba",
                    price: 9999.99,
                    model: "Modelo Prueba",
                    brand: "Marca Prueba",
                    category: categories[1]._id,
                    imageURL: "/uploads/f22.png",
                    stock: 20,
                    offer: 50,
                    weight: 100,
                    code: 12343567,
                    documentation: ["hola", "Documentacion Prueba"]
                },
            ];


            await Product.insertMany(products);
            console.log(`${products.length} default products created`);
        } else {
            console.log("Products already exist in the database");
        }
    } catch (error) {
        console.error("Error creating products:", error);
    }
}


async function initializeData() {
    try {
        await generateUsers();
        await generateCategories();
        await generateProducts();
        console.log("Data initialized successfully");
    } catch (error) {
        console.error("Error on initialize data:", error);
    }
}
export default initializeData;
