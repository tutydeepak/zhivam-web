"use client";

import React, { createContext, useState, useRef, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface CartContextType {
    cartCount: number;
    addToCart: () => void;
    cartIconRef: React.RefObject<HTMLButtonElement | null>;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);
    const cartIconRef = useRef<HTMLButtonElement | null>(null);

    const addToCart = () => {
        setCartCount(prevCount => prevCount + 1);
    };

    const value = { cartCount, addToCart, cartIconRef };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Create a custom hook for easy access to the context
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};