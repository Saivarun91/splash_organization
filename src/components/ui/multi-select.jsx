"use client"

import * as React from "react"
import { X, ChevronDown, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function MultiSelect({
    options = [],
    selected = [],
    onChange,
    placeholder = "Select items...",
    className,
    disabled = false,
    maxDisplay = 2,
}) {
    const [isOpen, setIsOpen] = React.useState(false)
    const dropdownRef = React.useRef(null)

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const toggleOption = (option) => {
        if (disabled) return

        const newSelected = selected.includes(option)
            ? selected.filter((item) => item !== option)
            : [...selected, option]

        onChange(newSelected)
    }

    const removeOption = (option, e) => {
        e.stopPropagation()
        if (disabled) return
        onChange(selected.filter((item) => item !== option))
    }

    // Bulk selection functions
    const selectAll = () => {
        if (disabled) return
        onChange([...options])
    }

    const deselectAll = () => {
        if (disabled) return
        onChange([])
    }

    const isAllSelected = selected.length === options.length && options.length > 0
    const isPartiallySelected = selected.length > 0 && selected.length < options.length

    const displayedItems = selected.slice(0, maxDisplay)
    const remainingCount = selected.length - maxDisplay

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm transition-colors text-foreground",
                    "hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent",
                    disabled && "cursor-not-allowed opacity-50 bg-secondary/50",
                    isOpen && "ring-2 ring-gold-solid/40 border-transparent"
                )}
            >
                <div className="flex flex-1 flex-wrap items-center gap-1">
                    {selected.length === 0 ? (
                        <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        <>
                            {displayedItems.map((item) => (
                                <Badge
                                    key={item}
                                    variant="secondary"
                                    className="bg-gold-solid/10 text-gold-solid border border-gold-muted/30 hover:bg-gold-solid/20 gap-1 px-2 py-0.5"
                                >
                                    <span className="max-w-[150px] truncate">{item}</span>
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-gold-solid/80"
                                        onClick={(e) => removeOption(item, e)}
                                    />
                                </Badge>
                            ))}
                            {remainingCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="bg-secondary text-muted-foreground border border-border hover:bg-secondary/80"
                                >
                                    +{remainingCount} more
                                </Badge>
                            )}
                        </>
                    )}
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isOpen && "transform rotate-180"
                    )}
                />
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No options available
                        </div>
                    ) : (
                        <div className="p-1">
                            {/* Bulk selection controls */}
                            {options.length > 1 && (
                                <div className="px-3 py-2 border-b border-border mb-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-4 h-4 border rounded flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-solid/40 border-border",
                                                    isAllSelected
                                                        ? "bg-gold-gradient border-gold-solid/50"
                                                        : isPartiallySelected
                                                            ? "bg-gold-gradient border-gold-solid/50"
                                                            : "border-border text-muted-foreground"
                                                )}
                                                onClick={isAllSelected ? deselectAll : selectAll}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
                                                        isAllSelected ? deselectAll() : selectAll()
                                                    }
                                                }}
                                                aria-label={isAllSelected ? 'Deselect all options' : 'Select all options'}
                                            >
                                                {isAllSelected ? (
                                                    <Check className="w-3 h-3 text-primary-foreground font-bold" />
                                                ) : isPartiallySelected ? (
                                                    <div className="w-2 h-0.5 bg-primary-foreground" />
                                                ) : null}
                                            </button>
                                            <span className="text-sm text-foreground">
                                                {isAllSelected ? 'Deselect All' : 'Select All'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {selected.length}/{options.length} selected
                                        </div>
                                    </div>
                                </div>
                            )}

                            {options.map((option) => {
                                const isSelected = selected.includes(option)
                                return (
                                    <button
                                        type="button"
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                toggleOption(option)
                                            }
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-gold-solid/40",
                                            "hover:bg-secondary/50",
                                            isSelected && "bg-gold-solid/10 text-gold-solid"
                                        )}
                                        aria-pressed={isSelected}
                                        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${option}`}
                                    >
                                        <div
                                            className={cn(
                                                "w-4 h-4 border rounded flex items-center justify-center shrink-0",
                                                isSelected
                                                    ? "bg-gold-gradient border-gold-solid/50"
                                                    : "border-border"
                                            )}
                                        >
                                            {isSelected && (
                                                <svg
                                                    className="w-3 h-3 text-primary-foreground"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={3}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-foreground flex-1 break-words">
                                            {option}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

