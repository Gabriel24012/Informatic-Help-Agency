import { Product } from './Products';

export type Cart = {
  user: {
    _id: string;
  };
  products: [
    {
      product: Product;
      quantity: number;
    }
  ];
};
