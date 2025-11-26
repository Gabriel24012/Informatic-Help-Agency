export type Category = {
    _id: string;
    name: string;
    description: string;
    imageURL: string | null;
    parentCategory?: string | { _id?: string; name?: string } | null;
};
