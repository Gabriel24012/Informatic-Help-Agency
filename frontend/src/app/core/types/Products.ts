import { Category } from './Category';

export type Product = {
    _id: string;
    name: string;
    description: string;
    ficha:string;
    price: number;
    model: string;
    brand: string;
    category: Category;
    imageURL: string[];
    stock: number;
    offer: number;
    weight?: number;
    code?: string;
    documentation?: string[];
};

export type ProductResponse = {
    products: Product[];
    pagination: {
        currentPage: number;
        hasNext: boolean;
        hasPrev: boolean;
        totalPages: number;
        totalResults: number;
    };
};
