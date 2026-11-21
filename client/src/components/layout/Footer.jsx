import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Clock, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Queue<span className="text-brand-400">Care</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Healthcare without the waiting room. Smart queuing, digital check-ins, and automated clinical workflows.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>HIPAA Compliant Data Security</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">Platform Features</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/checkin" className="hover:text-white transition-colors">Digital QR Check-In</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Support & Contact</Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Access Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Patient Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Physician Dashboard</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Clinic Administration</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">New Patient Registration</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Clinic Contact
            </h4>
            <div className="space-y-2.5 text-xs">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>450 Health Avenue, Suite 100, Metro City</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+1 (800) 555-CARE (2273)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>contact@queuecare.health</span>
              </p>
              <p className="flex items-center gap-2 text-slate-300 font-medium">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Mon - Sat: 8:00 AM – 8:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QueueCare Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
