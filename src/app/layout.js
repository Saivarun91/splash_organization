import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ImageGenerationProvider } from "@/context/ImageGenerationContext";

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
    icon: "/images/logo-splash.png",
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
              {children}
            </LanguageProvider>
          </ImageGenerationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
