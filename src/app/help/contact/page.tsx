'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HelpPagination from '@/components/ui/help-pagination';
import { Send, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'general',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl space-y-8 md:space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-block px-3 py-1 bg-[#d8a4bc]/10 rounded-full text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest">Support</div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">Get In Touch</h1>
        <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed uppercase tracking-wider">
          Our team is here to assist with any inquiries.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
        {/* Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="NAME"
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Email</label>
              <input
                type="email"
                name="email"
                placeholder="EMAIL@DOMAIN.COM"
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Order #</label>
              <input
                type="text"
                name="orderNumber"
                placeholder="OPTIONAL"
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Message</label>
            <textarea
              name="message"
              rows={4}
              placeholder="HOW CAN WE HELP?"
              className="w-full bg-gray-50 border border-gray-100 rounded-[32px] py-6 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-black transition-all resize-none"
            />
          </div>
          <button className="w-full bg-black text-white py-5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#d8a4bc] transition-all shadow-2xl active:scale-95">
            Send Message <Send size={14} />
          </button>
        </form>

        {/* Info */}
        <div className="space-y-10">
          <div className="p-8 md:p-10 bg-gray-50 rounded-[40px] border border-gray-100 space-y-8">
            {[
              { icon: <Mail size={18} />, label: 'Email', val: 'support@lowreligion.com' },
              { icon: <Phone size={18} />, label: 'Phone', val: '1-800-LOWREL' },
              { icon: <Clock size={18} />, label: 'Wait Time', val: '2-4 Hours' }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#d8a4bc] shadow-sm">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">{item.label}</p>
                  <p className="text-xs font-black uppercase tracking-widest">{item.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 md:p-10 bg-black text-white rounded-[40px] space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-[#d8a4bc]" />
              <h3 className="text-xs font-black uppercase tracking-widest">Global Support</h3>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">
              Our team operates across multiple timezones to ensure you never wait more than a few hours for a response.
            </p>
          </div>
        </div>
      </div>

      <HelpPagination />
    </div>
  );
}
