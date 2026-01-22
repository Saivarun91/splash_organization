"use client";

import { useState, createContext, useContext } from "react";

const TabsContext = createContext();

export function Tabs({ value, onValueChange, children, className = "" }) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className = "" }) {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 ${className}`}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, className = "" }) {
    const { value: selectedValue, onValueChange } = useContext(TabsContext);
    const isActive = selectedValue === value;

    return (
        <button
            onClick={() => onValueChange(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                isActive
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            } ${className}`}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children, className = "" }) {
    const { value: selectedValue } = useContext(TabsContext);

    if (selectedValue !== value) return null;

    return <div className={className}>{children}</div>;
}
