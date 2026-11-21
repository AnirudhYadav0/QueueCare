import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, ArrowRight, UserCheck, ShieldCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor';
    return '/patient';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-slate-800 bg-clip-text text-transparent">
                Queue<span className="text-brand-600">Care</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-teal-600 -mt-1">
                Smart Clinic Queue
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              Home
            </Link>
            <Link to="/features" className="hover:text-brand-600 transition-colors">
              Features
            </Link>
            <Link to="/about" className="hover:text-brand-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-brand-600 transition-colors">
              Contact
            </Link>
            <Link to="/checkin" className="hover:text-teal-600 font-semibold flex items-center gap-1">
              QR Check-In
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(getDashboardLink())}
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="md" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Features
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Contact
          </Link>
          <Link
            to="/checkin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-teal-700 hover:bg-teal-50 rounded-lg"
          >
            QR Check-In
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardLink());
                  }}
                >
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
