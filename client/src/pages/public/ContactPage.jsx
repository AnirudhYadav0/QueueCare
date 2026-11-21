import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Thank you! Your message has been received. Our clinical support team will follow up within 2 hours.');
  };

  return (
    <div className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Get in Touch</span>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            We’re Here to Help
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Have questions about QueueCare or need clinic onboarding assistance? Send us a note.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clinic Contact Info */}
          <div className="space-y-4">
            <Card padding="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Clinic Location</h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    450 Health Avenue, Suite 100<br />Metro City Medical Center
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Phone Support</h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    General: +1 (800) 555-CARE<br />Emergency Queue: Ext 104
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Operating Hours</h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Monday – Friday: 8:00 AM – 8:00 PM<br />Saturday: 9:00 AM – 5:00 PM<br />Sunday: Closed
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card padding="p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Inquiry Sent!</h3>
                  <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                    We received your message and will respond promptly to your email address.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', subject: '', message: '' });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      required
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Subject"
                    required
                    placeholder="Queue Care Inquiry / Appointment Question"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="How can we help you?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                    <Send className="w-4 h-4" /> Send Message
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
