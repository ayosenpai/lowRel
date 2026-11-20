'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { validateCouponCode } from '@/lib/actions/coupons';

interface CheckoutData {
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    apartment?: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
}

interface CheckoutContextType {
    checkoutData: CheckoutData;
    discountCode: string;
    discountAmount: number; // rate 0..1
    discountPercent: number; // e.g. 15
    updateCheckoutData: (data: Partial<CheckoutData>) => void;
    applyDiscount: (code: string) => Promise<boolean>;
    clearDiscount: () => void;
    resetCheckoutData: () => void;
}

const defaultData: CheckoutData = {
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    apartment: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
    const [checkoutData, setCheckoutData] = useState<CheckoutData>(defaultData);
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);

    const updateCheckoutData = (data: Partial<CheckoutData>) => {
        setCheckoutData(prev => ({ ...prev, ...data }));
    };

    const clearDiscount = () => {
        setDiscountCode('');
        setDiscountAmount(0);
        setDiscountPercent(0);
    };

    const applyDiscount = async (code: string) => {
        const normalizedCode = code.toUpperCase().trim();
        if (!normalizedCode) {
            clearDiscount();
            return true;
        }

        const result = await validateCouponCode(normalizedCode);
        if (result.valid && result.code) {
            setDiscountCode(result.code);
            setDiscountAmount(result.rate ?? 0);
            setDiscountPercent(result.value ?? 0);
            return true;
        }

        return false;
    };

    const resetCheckoutData = () => {
        setCheckoutData(defaultData);
        clearDiscount();
    };

    return (
        <CheckoutContext.Provider value={{
            checkoutData,
            discountCode,
            discountAmount,
            discountPercent,
            updateCheckoutData,
            applyDiscount,
            clearDiscount,
            resetCheckoutData
        }}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};
