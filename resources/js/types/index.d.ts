import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Timbangan {
    no_tiket: string;
    no_lambung?: string; // Optional, as it may not be present in all records
    tanggal: string;
    no_polisi: string;
    nama_supir: string;
    berat_masuk: number;
    berat_keluar?: number | null;
    netto?: number | null;
    sampah?: {
    jenis_sampah: string;
    id: number;
    };
    truk?: {
    no_polisi: string;
    };
}

export interface Truck {
    no_lambung: string;
    no_polisi: string;
    nama_supir: string;
    kode_supplier?: { nama_supplier: string };
    golongan?: string;
    barang?: { jenis_sampah: string };
};

export interface Sampah {
    id: number;
    jenis_sampah: string;
};

export interface Supplier {
    kode_supplier: string;
    nama_supplier: string;
    alamat: string;
};

export interface PageProps extends InertiaPageProps {
    newTicketNumber?: string;
    trucks: Truck[];
    sampahs: Sampah[];
    suppliers: Supplier[];
}
