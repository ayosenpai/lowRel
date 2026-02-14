'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

const COOKIE_STORAGE_KEY = 'lowrel-cookie-consent';

interface CookieConsentProps {
    onComplete?: () => void;
}

export default function CookieConsent({ onComplete }: CookieConsentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: true,
        marketing: true,
    });

    useEffect(() => {
        // Check if user has already consented
        const storedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
        if (!storedConsent) {
            setIsOpen(true);
            // Lock scrolling
            document.body.style.overflow = 'hidden';

            // Set default consent mode
            if (typeof window.gtag === 'function') {
                window.gtag('consent', 'default', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'wait_for_update': 500
                });
            }
        } else {
            // Restore preferences if needed or re-apply consent state
            const savedPrefs = JSON.parse(storedConsent);
            setPreferences(savedPrefs);
            applyConsent(savedPrefs);
        }

        return () => {
            // Cleanup: ensure scroll lock is removed on unmount
            document.body.style.overflow = '';
        };
    }, []);

    const applyConsent = (prefs: CookiePreferences) => {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'analytics_storage': prefs.analytics ? 'granted' : 'denied',
                'ad_storage': prefs.marketing ? 'granted' : 'denied',
                'ad_user_data': prefs.marketing ? 'granted' : 'denied',
                'ad_personalization': prefs.marketing ? 'granted' : 'denied'
            });

            // Push datalayer events for GTM triggers if needed
            if (prefs.analytics) {
                window.dataLayer?.push({ event: 'consent_accepted_analytics' });
            }
            if (prefs.marketing) {
                window.dataLayer?.push({ event: 'consent_accepted_advertising' });
            }
        }
    };

    const handleAcceptAll = () => {
        const allGiven = {
            necessary: true,
            analytics: true,
            marketing: true,
        };
        setPreferences(allGiven);
        saveConsent(allGiven);
    };

    const handleDeclineAll = () => {
        const noneGiven = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        setPreferences(noneGiven);
        saveConsent(noneGiven);
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    const saveConsent = (prefs: CookiePreferences) => {
        localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs));

        // Unlock scrolling
        document.body.style.overflow = '';

        // Set cookie primarily for server-side analytics (api/track)
        // If analytics or marketing is accepted, we consider it "true" or "all" for general tracking purposes
        const consentValue = (prefs.analytics || prefs.marketing) ? 'true' : 'false';
        const maxAge = 60 * 60 * 24 * 365; // 1 year
        document.cookie = `cookie_consent=${consentValue}; path=/; max-age=${maxAge}; SameSite=Lax`;

        applyConsent(prefs);
        setIsOpen(false);
        if (onComplete) onComplete();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 touch-none">
            <div className="w-full max-w-md bg-white border border-gray-200 shadow-2xl overflow-hidden font-sans">

                {/* Header */}
                <div className="p-6 pb-2">
                    <h2 className="text-xl font-bold tracking-tight uppercase mb-2">Cookie Preferences</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        We use cookies to enhance your experience, analyze traffic, and personalize content.
                    </p>
                </div>

                {/* Preferences Toggle Section */}
                {showPreferences && (
                    <div className="px-6 py-2 space-y-4 max-h-[40vh] overflow-y-auto border-t border-b border-gray-100 my-2">

                        {/* Necessary */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h3 className="text-sm font-semibold uppercase">Necessary</h3>
                                <p className="text-xs text-gray-500">Required for the site to function properly.</p>
                            </div>
                            <Switch checked={true} disabled />
                        </div>

                        {/* Analytics */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h3 className="text-sm font-semibold uppercase">Analytics</h3>
                                <p className="text-xs text-gray-500">Help us improve our website by collecting usage data.</p>
                            </div>
                            <Switch
                                checked={preferences.analytics}
                                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
                            />
                        </div>

                        {/* Marketing */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h3 className="text-sm font-semibold uppercase">Marketing</h3>
                                <p className="text-xs text-gray-500">Used to tailor advertising to your interests.</p>
                            </div>
                            <Switch
                                checked={preferences.marketing}
                                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
                            />
                        </div>

                        <div className="pt-2 text-xs text-gray-400">
                            <Link href="/privacy-policy" className="underline hover:text-black">Privacy Policy</Link> • <Link href="/cookie-policy" className="underline hover:text-black">Cookie Policy</Link>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 pt-2 flex flex-col gap-3">
                    {!showPreferences ? (
                        <>
                            <Button onClick={handleAcceptAll} className="w-full bg-black text-white hover:bg-gray-800 uppercase tracking-wider font-bold h-12">
                                Accept All
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={handleDeclineAll} variant="outline" className="w-full border-gray-300 hover:bg-gray-50 uppercase tracking-wider font-bold h-10 text-xs">
                                    Decline All
                                </Button>
                                <Button onClick={() => setShowPreferences(true)} variant="outline" className="w-full border-gray-300 hover:bg-gray-50 uppercase tracking-wider font-bold h-10 text-xs">
                                    Preferences
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button onClick={() => setShowPreferences(false)} variant="ghost" className="w-full hover:bg-gray-50 uppercase tracking-wider font-bold h-10 text-xs">
                                Back
                            </Button>
                            <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 uppercase tracking-wider font-bold h-10 text-xs">
                                Save Preferences
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
