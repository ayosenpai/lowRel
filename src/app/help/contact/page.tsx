'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MessageCircle,
  Send,
  Phone,
  Mail,
  Clock,
  MapPin,
  User,
  Package,
  CreditCard,
  Truck,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

// Simplified Link component for the preview environment
const Link = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

// Inline BackButton component
const BackButton = () => (
  <button
    onClick={() => window.history.back()}
    className="flex items-center gap-2 text-black hover:text-[#d8a4bc] transition-colors mb-6 group"
  >
    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
    <span className="font-medium">Back to Help Center</span>
  </button>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'general',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for reaching out. Our support team will respond to your inquiry within 24-48 hours.');
    setFormData({ name: '', email: '', orderNumber: '', subject: 'general', message: '' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20 py-12 md:py-20 px-5">
      <div className="container mx-auto max-w-5xl">
        <BackButton />

        <div className="text-center space-y-3 mb-12 md:mb-24">
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Contact Us</h1>
          <p className="text-sm md:text-lg text-gray-500 max-w-xl mx-auto">Have a question or feedback? We'd love to hear from you. Please fill out the form below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24">
          {/* Form Side */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs font-bold text-gray-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base outline-none transition-all focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5"
                    required
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs font-bold text-gray-700 ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base outline-none transition-all focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs font-bold text-gray-700 ml-1">Order Number (Optional)</label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    placeholder="#12345"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base outline-none transition-all focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-xs font-bold text-gray-700 ml-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base outline-none transition-all focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5 appearance-none"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Status</option>
                    <option value="return">Return Request</option>
                    <option value="product">Product Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs font-bold text-gray-700 ml-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 md:py-4 px-4 md:px-5 text-sm md:text-base outline-none transition-all focus:border-[#d8a4bc] focus:ring-4 focus:ring-[#d8a4bc]/5 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 md:py-5 rounded-full font-bold text-sm md:text-base hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Send Message
                <Send size={16} className="md:w-4.5 md:h-4.5" />
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="lg:col-span-5 space-y-8 md:space-y-12">
            <div className="bg-gray-50 p-6 md:p-12 rounded-[32px] md:rounded-[40px] space-y-8 md:space-y-12">
              <div className="space-y-2 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Get in touch</h3>
                <p className="text-sm text-gray-500">Prefer other methods? You can also reach us via phone or email during business hours.</p>
              </div>

              <div className="space-y-6 md:space-y-8">
                {[
                  { icon: <Phone size={22} />, label: 'Phone', val: '1-800-MINGA', sub: 'Mon-Fri 9am-6pm EST' },
                  { icon: <Mail size={22} />, label: 'Email', val: 'support@minga.io', sub: '24/7 Response time' },
                  { icon: <MapPin size={22} />, label: 'Location', val: 'New York, NY', sub: 'Corporate Headquarters' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-6 items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center text-[#d8a4bc] shadow-sm shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-base md:text-lg font-bold text-gray-900">{item.val}</p>
                      <p className="text-xs md:text-sm text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Metrics */}
            <div className="p-6 md:p-10 border border-gray-100 rounded-[32px] md:rounded-[40px] bg-white shadow-sm">
              <div className="flex items-center gap-3 md:gap-4 text-gray-500">
                <Clock size={18} className="text-[#d8a4bc] md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-semibold">Typical response time: <span className="text-gray-900 font-bold">2-4 Hours</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
