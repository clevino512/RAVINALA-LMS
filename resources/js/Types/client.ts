export interface Client {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ClientFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
}
