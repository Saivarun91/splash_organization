import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ImageGenerationProvider } from "@/context/ImageGenerationContext";
import { CreditsProvider } from "@/context/CreditsContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Organization Portal - Splash AI Studio",
  description: "Organization management portal for Splash AI Studio",
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ImageGenerationProvider>
            <LanguageProvider>
              <CreditsProvider>
                <div className="relative">
                  {children}
                  <Toaster position="top-right" />
                </div>
              </CreditsProvider>
            </LanguageProvider>
          </ImageGenerationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
