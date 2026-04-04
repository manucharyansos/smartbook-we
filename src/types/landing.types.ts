// src/types/landing.types.ts
// Keep in sync with backend business types
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
    icon: never;
    title: string;
    description: string;
    gradient?: string;
    businessTypes?: ('beauty' | 'dental')[];
}

export interface BusinessTypeCardProps {
    type: BusinessType;
    title: string;
    description: string;
    icon: any;
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