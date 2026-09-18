export interface Factory {
    id: number;
    user_id: number;
    business_name: string;
    industry_type?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    district?: string;
    address?: string;
    total_lines?: number;
    total_machines?: number;
    daily_capacity?: string;
    trade_license_no?: string;
    trade_license_file?: string;
    tin_no?: string;
    tin_file?: string;
    bin_no?: string;
    bin_file?: string;
    nid_file?: string;
    is_verified?: boolean;
    rating?: number | string;
    capabilities?: string[] | null;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    customer_id?: string;
    account_type?: string;
    is_subscribed?: boolean;
    subscription_expires_at?: string;
    email_verified_at?: string;
    phone_verified_at?: string;
    factory?: Factory | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};

