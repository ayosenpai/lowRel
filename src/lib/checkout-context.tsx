'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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
    discountAmount: number;
    updateCheckoutData: (data: Partial<CheckoutData>) => void;
    applyDiscount: (code: string) => boolean;
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

    const updateCheckoutData = (data: Partial<CheckoutData>) => {
        setCheckoutData(prev => ({ ...prev, ...data }));
    };

    const applyDiscount = (code: string) => {
        const normalizedCode = code.toUpperCase().trim();
        if (!normalizedCode) {
            // Empty code clears the applied discount
            setDiscountCode('');
            setDiscountAmount(0);
            return true;
        }
        if (normalizedCode === 'MATTERBABY') {
            setDiscountCode('MATTERBABY');
            setDiscountAmount(0.15); // 15% discount
            return true;
        }
        return false;
    };

    const resetCheckoutData = () => {
        setCheckoutData(defaultData);
        setDiscountCode('');
        setDiscountAmount(0);
    };

    return (
        <CheckoutContext.Provider value={{
            checkoutData,
            discountCode,
            discountAmount,
            updateCheckoutData,
            applyDiscount,
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
