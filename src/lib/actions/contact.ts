'use server';

import { db } from '@/db';
import { contactMessages } from '@/db/schema';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactFormState {
    status: 'idle' | 'success' | 'error';
    message?: string;
}

export async function submitContactMessage(
    prevState: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const orderNumber = String(formData.get('orderNumber') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
        return { status: 'error', message: 'Please fill in your name, email and message.' };
    }

    if (!EMAIL_RE.test(email)) {
        return { status: 'error', message: 'Please enter a valid email address.' };
    }

    if (message.length > 5000) {
        return { status: 'error', message: 'Message is too long. Please keep it under 5000 characters.' };
    }

    try {
        await db.insert(contactMessages).values({
            name,
            email,
            subject: subject || 'General enquiry',
            message: orderNumber ? `Order #${orderNumber}\n\n${message}` : message,
        });

        return {
            status: 'success',
            message: 'Thanks — your message has been received. We usually reply within 24 hours.',
        };
    } catch (error) {
        console.error('[contact] Failed to store message:', error);
        return { status: 'error', message: 'Something went wrong. Please try again.' };
    }
}
