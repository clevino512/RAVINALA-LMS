export interface Product {
    id: number;
    name: string;
    description?: string | null;
    price: number | string;
    stock_quantity: number;
    photo_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock_quantity: string;
    photo_url: File | null;
}
