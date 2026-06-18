"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react"

// Hierarchical structure for ornament types
const ORNAMENT_CATEGORIES = {
    "Necklace": [
        { id: "short_necklace", name: "Short Necklace" },
        { id: "long_necklace", name: "Long Necklace" },
        { id: "choker", name: "Choker" },
        { id: "pendant", name: "Pendant" },
        { id: "pendant_necklace", name: "Pendant Necklace" },
        { id: "pendant_necklace_set", name: "Pendant Necklace Set" },
        { id: "delicate_necklace", name: "Delicate Necklace" },
        { id: "layered_necklace", name: "Layered Necklace" },
        { id: "necklace_set", name: "Necklace Set" },
        { id: "black_beads_necklace", name: "Black Beads Necklace" },
        { id: "hasli", name: "Hasli" },
    ],
    "Earrings": [
        { id: "stud_earrings", name: "Stud Earrings" },
        { id: "jhumka_earrings", name: "Jhumka / Jhumki Earrings" },
        { id: "drop_earrings", name: "Drop Earrings" },
        { id: "hoop_earrings", name: "Hoop / Hoop Earrings" },
        { id: "chandbali", name: "Chandbali" },
        { id: "damini", name: "Damini" },
        { id: "ear_chain", name: "Ear Chain" },
    ],
    "Bracelets & Bangles": [
        { id: "bangle", name: "Bangle" },
        { id: "bracelet", name: "Bracelet" },
        { id: "hand_chain", name: "Hand Chain" },
    ],
    "Rings": [
        { id: "ring", name: "Ring" },
        { id: "traditional_ring", name: "Traditional Ring" },
        { id: "delicate_ring", name: "Delicate Ring" },
        { id: "cocktail_ring", name: "Cocktail Ring" },
    ],
    "Anklets": [
        { id: "anklets", name: "Anklets" },
    ],
    "Head Jewelry": [
        { id: "maang_tikka", name: "Maang Tikka" },
        { id: "hair_brooch", name: "Hair Brooch" },
    ],
    "Nose Jewelry": [
        { id: "nose_ring", name: "Nose Ring" },
        { id: "nose_pin", name: "Nose Pin" },
    ],
    "Arm Jewelry": [
        { id: "armlet", name: "Armlet" },
    ],
    "Waist Jewelry": [
        { id: "waist_band", name: "Waist Band" },
    ],
    "Charms": [
        { id: "charm", name: "Charm" },
    ],
}

export function HierarchicalOrnamentSelect({ selectedType, onTypeChange, className = "" }) {
    const [isOpen, setIsOpen] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState(new Set())
    const dropdownRef = useRef(null)

    // Find selected ornament details
    const selectedOrnament = Object.entries(ORNAMENT_CATEGORIES)
        .flatMap(([category, items]) => items.map(item => ({ ...item, category })))
        .find(item => item.id === selectedType)

    const handleTypeSelect = (typeId) => {
        onTypeChange(typeId)
        setIsOpen(false)
    }

    const toggleCategory = (category) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev)
            if (newSet.has(category)) {
                newSet.delete(category)
            } else {
                newSet.add(category)
            }
            return newSet
        })
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent transition-all flex items-center justify-between hover:border-gold-muted/50"
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-solid flex-shrink-0" />
                    {selectedOrnament ? (
                        <span className="truncate text-left">{selectedOrnament.category} - {selectedOrnament.name}</span>
                    ) : (
                        <span className="text-muted-foreground">Select type</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {Object.entries(ORNAMENT_CATEGORIES).map(([category, items]) => {
                        const isExpanded = expandedCategories.has(category)
                        return (
                            <div key={category}>
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent/40 flex items-center justify-between transition-colors border-b border-border last:border-b-0"
                                >
                                    <span className="font-semibold text-foreground">{category}</span>
                                    {isExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                </button>
                                {isExpanded && (
                                    <div className="bg-accent/10">
                                        {items.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleTypeSelect(item.id)}
                                                className={`w-full px-6 py-1.5 text-sm text-left hover:bg-gold-solid/10 hover:text-gold-solid flex items-center gap-2 transition-colors ${selectedType === item.id ? 'bg-gold-solid/20 text-gold-solid font-semibold border-l-2 border-gold-solid' : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {item.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

