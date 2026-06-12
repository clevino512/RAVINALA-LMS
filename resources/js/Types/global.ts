export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface AuthUser {
    user: User;
    roles: string[];
    permissions: string[];
}

export interface FlashMessage {
    success?: string;
    error?: string;
}

export interface SharedPageProps {
    auth: AuthUser;
    flash: FlashMessage;
}
