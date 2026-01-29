"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Initialize language from user profile, localStorage, or default to 'en'
  // Initialize language from user profile, localStorage, or default to 'en'
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
      // First try to get from user profile (organization portal uses org_user)
      const savedUser = localStorage.getItem('org_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          const preferredLang = userData?.preferred_language;
          if (preferredLang && (preferredLang === 'en' || preferredLang === 'es')) {
            console.log('[LanguageContext] Initial language from user profile:', preferredLang);
            return preferredLang;
          }
        } catch (e) {
          console.error('[LanguageContext] Error parsing user data:', e);
        }
      }
      // Fallback to localStorage
      const savedLanguage = localStorage.getItem('preferredLanguage');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        console.log('[LanguageContext] Initial language from localStorage:', savedLanguage);
        return savedLanguage;
      }
    }
    console.log('[LanguageContext] Using default language: en');
    return 'en';
  };
  
  const [language, setLanguage] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState({});

  // Load translations immediately on mount
  useEffect(() => {
    const loadInitialTranslations = async () => {
      const initialLang = getInitialLanguage();
      try {
        console.log('[LanguageContext] Loading initial translations for:', initialLang);
        const translationsModule = await import(`@/locales/${initialLang}.json`);
        setTranslations(translationsModule.default);
        console.log('[LanguageContext] Initial translations loaded');
      } catch (error) {
        console.error('[LanguageContext] Failed to load initial translations:', error);
        try {
          const enTranslations = await import('@/locales/en.json');
          setTranslations(enTranslations.default);
        } catch (e) {
          console.error('[LanguageContext] Failed to load English fallback:', e);
        }
      }
    };
    loadInitialTranslations();
  }, []);

  // Load language from user profile when available - check periodically and on storage events
  useEffect(() => {
    const checkUserLanguage = () => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('org_user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            const preferredLang = userData?.preferred_language;
            
            if (preferredLang && (preferredLang === 'en' || preferredLang === 'es')) {
              setLanguage((currentLang) => {
                // Only update if it's different to avoid unnecessary re-renders
                if (currentLang !== preferredLang) {
                  console.log('[LanguageContext] Updating language from', currentLang, 'to', preferredLang);
                  return preferredLang;
                }
                return currentLang;
              });
              localStorage.setItem('preferredLanguage', preferredLang);
            } else {
              // If no preferred_language in user data, check localStorage fallback
              const fallbackLang = localStorage.getItem('preferredLanguage');
              if (fallbackLang && (fallbackLang === 'en' || fallbackLang === 'es')) {
                setLanguage((currentLang) => {
                  if (currentLang !== fallbackLang) {
                    console.log('[LanguageContext] Using fallback language:', fallbackLang);
                    return fallbackLang;
                  }
                  return currentLang;
                });
              }
            }
          } catch (e) {
            console.error('[LanguageContext] Error parsing user data:', e);
          }
        } else {
          // No user data, check localStorage fallback
          const fallbackLang = localStorage.getItem('preferredLanguage');
          if (fallbackLang && (fallbackLang === 'en' || fallbackLang === 'es')) {
            setLanguage((currentLang) => {
              if (currentLang !== fallbackLang) {
                return fallbackLang;
              }
              return currentLang;
            });
          }
        }
      }
    };

    // Check immediately
    checkUserLanguage();

    // Listen for storage changes (when user logs in from different tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'org_user' || e.key === 'preferredLanguage') {
        console.log('[LanguageContext] Storage event detected:', e.key);
        checkUserLanguage();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom event when user logs in (same window)
    const handleUserLogin = (e) => {
      console.log('[LanguageContext] User login event detected', e.detail);
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        checkUserLanguage();
      }, 50);
    };
    window.addEventListener('org_user_updated', handleUserLogin);

    // Also check periodically in case localStorage was updated in the same window
    const interval = setInterval(checkUserLanguage, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('org_user_updated', handleUserLogin);
      clearInterval(interval);
    };
  }, []);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      if (!language) return;
      
      try {
        console.log('[LanguageContext] Loading translations for language:', language);
        const translationsModule = await import(`@/locales/${language}.json`);
        setTranslations(translationsModule.default);
        console.log('[LanguageContext] Translations loaded successfully');
      } catch (error) {
        console.error(`[LanguageContext] Failed to load translations for ${language}:`, error);
        // Fallback to English if language file doesn't exist
        if (language !== 'en') {
          try {
            const enTranslations = await import('@/locales/en.json');
            setTranslations(enTranslations.default);
            console.log('[LanguageContext] Fallback to English translations');
          } catch (e) {
            console.error('[LanguageContext] Failed to load English fallback:', e);
          }
        }
      }
    };

    loadTranslations();
  }, [language]);

  // Save language preference to backend and localStorage when it changes
  const changeLanguage = async (newLanguage) => {
    if (newLanguage === 'en' || newLanguage === 'es') {
      setLanguage(newLanguage);
      localStorage.setItem('preferredLanguage', newLanguage);
      
      // Save to backend if user is logged in
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('org_auth_token');
        if (token) {
          try {
            // Import api dynamically to avoid circular dependencies
            const { authAPI } = await import('@/lib/api');
            const response = await authAPI.updateUserProfile({ preferred_language: newLanguage });
            
            if (response?.success && response?.user) {
              // Update user in localStorage
              const savedUser = localStorage.getItem('org_user');
              if (savedUser) {
                try {
                  const userData = JSON.parse(savedUser);
                  userData.preferred_language = newLanguage;
                  localStorage.setItem('org_user', JSON.stringify(userData));
                } catch (e) {
                  console.error('Error updating user in localStorage:', e);
                }
              }
            }
          } catch (error) {
            console.error('Failed to save language preference to backend:', error);
            // Continue anyway - language is saved locally
          }
        }
      }
    }
  };

  // Translation function
  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key if translation not found
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
