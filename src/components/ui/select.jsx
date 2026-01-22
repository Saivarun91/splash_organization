"use client";

import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";

const SelectContext = createContext();

export function Select({ value, onValueChange, children, className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
            <div className={`relative ${className}`} ref={selectRef}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ id, className = "", children, ...props }) {
    const { isOpen, setIsOpen } = useContext(SelectContext);

    return (
        <button
            id={id}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
            <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
    );
}

export function SelectValue({ placeholder = "Select..." }) {
    const { value } = useContext(SelectContext);
    return <span className={value ? "text-gray-900" : "text-gray-500"}>{value || placeholder}</span>;
}

export function SelectContent({ children, className = "" }) {
    const { isOpen } = useContext(SelectContext);

    if (!isOpen) return null;

    return (
        <div
            className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md mt-1 ${className}`}
        >
            {children}
        </div>
    );
}

export function SelectItem({ value, children, className = "", ...props }) {
    const { value: selectedValue, onValueChange, setIsOpen } = useContext(SelectContext);

    const handleClick = () => {
        onValueChange(value);
        setIsOpen(false);
    };

    return (
        <div
            onClick={handleClick}
            className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
                selectedValue === value ? "bg-blue-50 text-blue-900" : ""
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
