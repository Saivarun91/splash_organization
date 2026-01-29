"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TutorialsPage() {
    const { t } = useLanguage();
    const tutorials = [
        {
            id: 1,
            title: t("orgPortal.tutorial1Title"),
            description: t("orgPortal.tutorial1Description"),
            duration: "5 min",
            level: t("orgPortal.beginner"),
            thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
            type: "video",
        },
        {
            id: 2,
            title: t("orgPortal.tutorial2Title"),
            description: t("orgPortal.tutorial2Description"),
            duration: "8 min",
            level: t("orgPortal.intermediate"),
            thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
            type: "video",
        },
        {
            id: 3,
            title: t("orgPortal.tutorial3Title"),
            description: t("orgPortal.tutorial3Description"),
            duration: "10 min",
            level: t("orgPortal.advanced"),
            thumbnail: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400",
            type: "video",
        },
        {
            id: 4,
            title: t("orgPortal.tutorial4Title"),
            description: t("orgPortal.tutorial4Description"),
            duration: "6 min",
            level: t("orgPortal.intermediate"),
            thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
            type: "article",
        },
    ];

    const getLevelColor = (level) => {
        if (level === t("orgPortal.beginner")) return "bg-green-100 text-green-800";
        if (level === t("orgPortal.intermediate")) return "bg-blue-100 text-blue-800";
        if (level === t("orgPortal.advanced")) return "bg-purple-100 text-purple-800";
        return "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6 animate-fade-in p-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("orgPortal.tutorialsWalkthroughs")}</h1>
                <p className="text-gray-600">{t("orgPortal.learnHowToGetMostOut")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial) => (
                    <Card
                        key={tutorial.id}
                        className="group overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                                {tutorial.type === "video" ? (
                                    <PlayCircle className="w-16 h-16 text-white opacity-50" />
                                ) : (
                                    <FileText className="w-16 h-16 text-white opacity-50" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-transparent flex items-center justify-center">
                                {tutorial.type === "video" ? (
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlayCircle className="w-10 h-10 text-white" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="w-10 h-10 text-white" />
                                    </div>
                                )}
                            </div>
                            <Badge className="absolute top-4 right-4 bg-blue-600/80 backdrop-blur-sm">
                                {tutorial.duration}
                            </Badge>
                        </div>
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={getLevelColor(tutorial.level)} variant="outline">
                                    {tutorial.level}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                {tutorial.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">{tutorial.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
