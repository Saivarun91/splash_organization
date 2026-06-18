"use client"

import { Check } from "lucide-react"

export function WorkflowSteps({ activeStep, setActiveStep, savedSteps, isStepUnlocked, isGenerating = false }) {
    const steps = [
        { number: 1, title: "Brief & Concept" },
        { number: 2, title: "Moodboard Setup" },
        { number: 3, title: "Model Preview Selection" },
        { number: 4, title: "Product Upload" },
        { number: 5, title: "Final Image Generation" },
    ]

    return (
        <div className="rounded-lg">
            <div className="rounded-lg p-4">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isActive = step.number === activeStep
                        const isCompleted = step.number < activeStep
                        const canClick = !isGenerating && isStepUnlocked(step.number)

                        return (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        role={canClick ? "button" : undefined}
                                        tabIndex={canClick ? 0 : -1}
                                        className={`flex items-center justify-center w-10 h-10 rounded-full ${isCompleted
                                            ? "bg-gold-gradient text-primary-foreground"
                                            : isActive
                                                ? "bg-gold-gradient border-2 border-gold-solid text-primary-foreground"
                                                : "bg-secondary border border-border text-muted-foreground"
                                            } ${canClick ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                                        onClick={() => {
                                            if (canClick) {
                                                setActiveStep(step.number)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (canClick && (e.key === "Enter" || e.key === " ")) {
                                                e.preventDefault()
                                                setActiveStep(step.number)
                                            }
                                        }}
                                        title={isGenerating ? "Image generation in progress..." : ""}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                                        ) : isActive ? (
                                            <span className="font-semibold text-base">{step.number}</span>
                                        ) : (
                                            <span className="font-semibold text-sm">{step.number}</span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-center text-foreground font-medium">
                                        {step.title}
                                    </p>
                                </div>
                                {index !== steps.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-2 ${step.number < activeStep ? "bg-gold-solid" : "bg-border"}`} style={{ minWidth: '20px' }}></div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
