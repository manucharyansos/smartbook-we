// src/types/landing.types.ts
// Keep in sync with backend business types
import type { LucideIcon } from 'lucide-react';

export type BusinessType = 'beauty' | 'dental' | null;

export interface PricingPlan {
    name: string;
    price: {
        beauty: string;
        dental: string;
    };
    period: string;
    description: string;
    perks: string[];
    featured?: boolean;
    popularFor?: string;
    businessTypes: ('beauty' | 'dental')[];
}

export interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
    gradient?: string;
    businessTypes?: ('beauty' | 'dental')[];
}

export interface BusinessTypeCardProps {
    type: BusinessType;
    title: string;
    description: string;
    icon: LucideIcon;
    features: string[];
    price?: string;
    isSelected: boolean;
    onSelect: () => void;
}

export interface Testimonial {
    quote: string;
    author: string;
    role: string;
    rating: number;
    type: BusinessType;
    businessName: string;
    image?: string;
}
