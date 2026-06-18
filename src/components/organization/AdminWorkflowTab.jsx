"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminBriefAndConcept } from "./workflow/AdminBriefAndConcept";
import { AdminThemesAndBackgrounds } from "./workflow/AdminThemesAndBackgrounds";
import { AdminColorPalette } from "./workflow/AdminColorPalette";
import { AdminGlobalInstructions } from "./workflow/AdminGlobalInstructions";
import { AdminModelSelection } from "./workflow/AdminModelSelection";
import { AdminProductUpload } from "./workflow/AdminProductUpload";
import { AdminImageGeneration } from "./workflow/AdminImageGeneration";

export function AdminWorkflowTab({ project, collectionData }) {
    const [activeStep, setActiveStep] = useState(1);

    const steps = [
        { number: 1, title: "Brief & Concept" },
        { number: 2, title: "Moodboard Setup" },
        { number: 3, title: "Model Preview Selection" },
        { number: 4, title: "Product Upload" },
        { number: 5, title: "Final Image Generation" },
    ];

    // Determine which steps are completed
    const isStepCompleted = (stepNumber) => {
        if (!collectionData) return false;
        const item = collectionData.items?.[0];

        switch (stepNumber) {
            case 1:
                return !!(
                    collectionData.description ||
                    collectionData.target_audience ||
                    collectionData.campaign_season
                );
            case 2:
                return !!(
                    (item?.selected_themes && item.selected_themes.length > 0) ||
                    (item?.selected_backgrounds && item.selected_backgrounds.length > 0) ||
                    (item?.selected_colors && item.selected_colors.length > 0) ||
                    (item?.global_instructions && item.global_instructions.trim())
                );
            case 3:
                return !!(item?.selected_model || (item?.uploaded_models && item.uploaded_models.length > 0));
            case 4:
                return !!(item?.product_images && item.product_images.length > 0);
            case 5:
                return !!(collectionData.generated_prompts && Object.keys(collectionData.generated_prompts).length > 0);
            default:
                return false;
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return <AdminBriefAndConcept collectionData={collectionData} />;
            case 2:
                return (
                    <>
                        <AdminThemesAndBackgrounds collectionData={collectionData} />
                        <AdminColorPalette collectionData={collectionData} />
                        <AdminGlobalInstructions collectionData={collectionData} />
                    </>
                );
            case 3:
                return <AdminModelSelection collectionData={collectionData} />;
            case 4:
                return <AdminProductUpload collectionData={collectionData} />;
            case 5:
                return <AdminImageGeneration collectionData={collectionData} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Workflow Steps Navigation */}
            <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isActive = step.number === activeStep;
                        const isCompleted = isStepCompleted(step.number);
 
                        return (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setActiveStep(step.number)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                setActiveStep(step.number);
                                            }
                                        }}
                                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                            isCompleted
                                                ? "bg-gold-gradient text-primary-foreground font-bold"
                                                : isActive
                                                  ? "bg-gold-gradient text-primary-foreground ring-2 ring-gold-muted font-bold"
                                                  : "bg-secondary border border-border text-muted-foreground"
                                        } cursor-pointer hover:scale-105`}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
                                        ) : (
                                            <span
                                                className={`font-semibold ${isActive ? "text-primary-foreground text-base" : "text-muted-foreground text-sm"}`}
                                            >
                                                {step.number}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-center text-foreground font-medium">{step.title}</p>
                                </div>
                                {index !== steps.length - 1 && (
                                    <div
                                        className={`h-0.5 flex-1 mx-2 ${
                                            step.number < activeStep ? "bg-gold-solid" : "bg-border"
                                        }`}
                                        style={{ minWidth: "20px" }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
 
            {/* Step Content */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                {renderStepContent()}
            </div>
 
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                    disabled={activeStep === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronLeft size={18} />
                    Previous
                </button>
                <button
                    onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
                    disabled={activeStep === 5}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-gradient text-primary-foreground font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md"
                >
                    Next
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
