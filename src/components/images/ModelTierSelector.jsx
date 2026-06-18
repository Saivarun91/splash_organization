"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export const MODEL_TIER = {
    REGULAR: "regular",
    PREMIUM: "premium",
}

export const MODEL_TIER_DEFAULTS = {
    themed: MODEL_TIER.REGULAR,
    model: MODEL_TIER.PREMIUM,
    campaign: MODEL_TIER.PREMIUM,
}

const OPTIONS = [
    { value: MODEL_TIER.REGULAR, label: "Regular" },
    { value: MODEL_TIER.PREMIUM, label: "Premium" },
]

function OptionLabel({ label, recommended = false }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span>{label}</span>
            {recommended ? (
                <span className="text-xs font-normal text-muted-foreground">(recommended)</span>
            ) : null}
        </span>
    )
}

export function ModelTierSelector({
    value,
    onChange,
    context,
    compact = false,
    className = "",
}) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)
    const [menuPlacement, setMenuPlacement] = useState("bottom")
    const containerRef = useRef(null)
    const recommendedTier = context ? MODEL_TIER_DEFAULTS[context] : null
    const heading = t("images.generationModel") || "Generation model"
    const labelClassName = compact
        ? "block text-sm font-semibold text-foreground mb-3"
        : "block text-lg font-semibold text-foreground mb-4"

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

    const handleSelect = (nextValue) => {
        onChange(nextValue)
        setOpen(false)
    }

    const toggleOpen = () => {
        if (!open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setMenuPlacement(spaceBelow < 120 ? "top" : "bottom")
        }
        setOpen((prev) => !prev)
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <label id="model-tier-label" className={labelClassName}>
                {heading}
            </label>
            <button
                type="button"
                aria-labelledby="model-tier-label"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={toggleOpen}
                className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-border bg-input px-3 py-2.5 text-left text-sm font-semibold text-foreground shadow-none transition-colors hover:border-gold-muted hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                <OptionLabel
                    label={selected.label}
                    recommended={recommendedTier === selected.value}
                />
                <ChevronDownIcon
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open ? (
                <ul
                    role="listbox"
                    aria-labelledby="model-tier-label"
                    className={`absolute left-0 right-0 z-50 overflow-hidden rounded-xl border-2 border-border bg-input p-1 shadow-lg ${
                        menuPlacement === "top" ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                >
                    {OPTIONS.map((option) => {
                        const isSelected = option.value === value
                        return (
                            <li key={option.value} role="option" aria-selected={isSelected}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                        isSelected
                                            ? "bg-accent text-foreground"
                                            : "text-foreground hover:bg-accent"
                                    }`}
                                >
                                    <OptionLabel
                                        label={option.label}
                                        recommended={recommendedTier === option.value}
                                    />
                                    {isSelected ? (
                                        <CheckIcon className="size-4 shrink-0 text-gold-solid" />
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
