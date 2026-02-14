'use client';

import React, { useState, useEffect } from 'react';
import CookieConsent from '@/components/cookie-consent/cookie-modal';
import NewsletterModal from '@/components/newsletter-popup/newsletter-modal';

const COOKIE_STORAGE_KEY = 'lowrel-cookie-consent';
const NEWSLETTER_STORAGE_KEY = 'lowrel-newsletter-seen';

export default function ModalSequenceManager() {
    const [currentStep, setCurrentStep] = useState<'NONE' | 'COOKIE' | 'NEWSLETTER'>('NONE');

    useEffect(() => {
        // Check if cookie consent is already given
        const hasConsented = localStorage.getItem(COOKIE_STORAGE_KEY);
        const hasSeenNewsletter = localStorage.getItem(NEWSLETTER_STORAGE_KEY);

        if (!hasConsented) {
            setCurrentStep('COOKIE');
        } else if (!hasSeenNewsletter) {
            setCurrentStep('NEWSLETTER');
        }
    }, []);

    const handleCookieComplete = () => {
        // Check if we should show newsletter (we always show it after cookie unless they've seen it)
        const hasSeenNewsletter = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
        if (!hasSeenNewsletter) {
            setCurrentStep('NEWSLETTER');
        } else {
            setCurrentStep('NONE');
        }
    };

    const handleNewsletterClose = () => {
        localStorage.setItem(NEWSLETTER_STORAGE_KEY, 'true');
        setCurrentStep('NONE');
    };

    return (
        <>
            {currentStep === 'COOKIE' && (
                <CookieConsent onComplete={handleCookieComplete} />
            )}
            {currentStep === 'NEWSLETTER' && (
                <NewsletterModal isOpen={true} onClose={handleNewsletterClose} />
            )}
        </>
    );
}
