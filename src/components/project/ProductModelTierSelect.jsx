"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const OPTIONS = [
    { value: "regular", label: "Regular" },
    // { value: "premium", label: "Premium" }, // Disabled for now
]

const RECOMMENDED_BY_CONTEXT = {
    themed: "regular",
    model: "regular",
    campaign: "regular",
}

// Generation model selector hidden; regular tier is applied by default in the background.
const SHOW_GENERATION_MODEL_UI = false

export function ProductModelTierSelect({ value, onChange, context, disabled = false }) {
    const [open, setOpen] = useState(false)
    const [menuPlacement, setMenuPlacement] = useState("bottom")
    const containerRef = useRef(null)
    const recommended = RECOMMENDED_BY_CONTEXT[context] || "regular"
    const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0]

    useEffect(() => {
        if (!open) return

        const handlePointerDown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false)
        }

        document.addEventListener("mousedown", handlePointerDown)
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("mousedown", handlePointerDown)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [open])

    const toggleOpen = () => {
        if (disabled) return
        if (!open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setMenuPlacement(spaceBelow < 120 ? "top" : "bottom")
        }
        setOpen((prev) => !prev)
    }

    const handleSelect = (nextValue) => {
        onChange(nextValue)
        setOpen(false)
    }

    if (!SHOW_GENERATION_MODEL_UI) return null

    return (
        <div ref={containerRef} className="relative w-[108px] mx-auto">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
                onClick={toggleOpen}
                className="flex w-full items-center justify-between gap-1 rounded-lg border border-border bg-input px-2 py-1 text-left text-xs font-medium text-foreground transition-colors hover:border-gold-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className="truncate">{selected.label}</span>
                <ChevronDownIcon
                    className={`size-3 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open ? (
                <ul
                    role="listbox"
                    className={`absolute left-0 right-0 z-50 overflow-hidden rounded-lg border border-border bg-input p-1 shadow-lg ${
                        menuPlacement === "top" ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                >
                    {OPTIONS.map((option) => {
                        const isSelected = option.value === value
                        const isRecommended = recommended === option.value
                        return (
                            <li key={option.value} role="option" aria-selected={isSelected}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                                        isSelected
                                            ? "bg-accent text-foreground"
                                            : "text-foreground hover:bg-accent"
                                    }`}
                                >
                                    <span>
                                        {option.label}
                                        {isRecommended ? (
                                            <span className="ml-1 text-[10px] text-muted-foreground">*</span>
                                        ) : null}
                                    </span>
                                    {isSelected ? (
                                        <CheckIcon className="size-3 shrink-0 text-gold-solid" />
                                    ) : null}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            ) : null}
        </div>
    )
}

export function defaultProductRowSelection() {
    return {
        plainBg: false,
        bgReplace: false,
        model: false,
        campaign: false,
        modelTiers: {
            plainBg: "regular",
            bgReplace: "regular",
            model: "regular",
            campaign: "regular",
        },
    }
}

export function mergeProductRowSelection(saved = {}) {
    const defaults = defaultProductRowSelection()
    const mergedModelTiers = {
        ...defaults.modelTiers,
        ...(saved.modelTiers || {}),
    }

    return {
        ...defaults,
        ...saved,
        modelTiers: Object.fromEntries(
            Object.keys(mergedModelTiers).map((key) => [key, "regular"])
        ),
    }
}
