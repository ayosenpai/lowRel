'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '@/lib/types';

export interface WishlistItem extends Product { }

interface WishlistState {
    items: WishlistItem[];
}

type WishlistAction =
    | { type: 'ADD_TO_WISHLIST'; payload: Product }
    | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
    | { type: 'TOGGLE_WISHLIST'; payload: Product }
    | { type: 'SET_WISHLIST'; payload: WishlistItem[] };

const initialState: WishlistState = {
    items: [],
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
    switch (action.type) {
        case 'ADD_TO_WISHLIST':
            if (state.items.find((item) => item.id === action.payload.id)) {
                return state;
            }
            return {
                ...state,
                items: [...state.items, action.payload],
            };

        case 'REMOVE_FROM_WISHLIST':
            return {
                ...state,
                items: state.items.filter((item) => item.id !== action.payload),
            };

        case 'TOGGLE_WISHLIST':
            const isItemInWishlist = state.items.find((item) => item.id === action.payload.id);
            if (isItemInWishlist) {
                return {
                    ...state,
                    items: state.items.filter((item) => item.id !== action.payload.id),
                };
            }
            return {
                ...state,
                items: [...state.items, action.payload],
            };

        case 'SET_WISHLIST':
            return {
                ...state,
                items: action.payload,
            };

        default:
            return state;
    }
};

const WishlistContext = createContext<{
    state: WishlistState;
    dispatch: React.Dispatch<WishlistAction>;
} | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(wishlistReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            dispatch({ type: 'SET_WISHLIST', payload: JSON.parse(savedWishlist) });
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(state.items));
    }, [state.items]);

    return (
        <WishlistContext.Provider value={{ state, dispatch }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
