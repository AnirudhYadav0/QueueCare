import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Users,
  Activity,
  CheckCircle2,
  CalendarCheck,
  Bell,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Next-Gen Clinic Queue & Smart Appointment Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Healthcare Without the{' '}
              <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                Waiting Room
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              QueueCare eliminates crowded clinic lobbies with real-time digital queues,
              instant QR check-in, and dynamic wait-time calculation for both patients and healthcare providers.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-md shadow-brand-500/20">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/patient/book">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <CalendarCheck className="w-4 h-4 text-brand-600" /> Book an Appointment
                </Button>
              </Link>
              <Link to="/checkin">
                <Button size="lg" variant="teal" className="w-full sm:w-auto">
                  <QrCode className="w-4 h-4" /> QR Check-In
                </Button>
              </Link>
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="mt-8 inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-100/90 border border-slate-200 px-4 py-2 rounded-xl">
              <span className="font-semibold text-slate-700">Explore Demo:</span>
              <span>1-click login available for Patient, Doctor, and Admin on the Sign In page</span>
            </div>
          </div>

          {/* Interactive Live Queue Preview Mockup */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-200/80 ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-slate-400">QueueCare Live Engine Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Doctor Queue
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Serving */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Currently Serving</span>
                    <div className="text-4xl font-extrabold text-teal-400 mt-2">CARD-02</div>
                    <p className="text-xs text-slate-300 mt-1">Michael Brown • In Consultation</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    Dr. Sarah Jenkins • Room 101
                  </div>
                </div>

                {/* Patient Token Card */}
                <div className="bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-brand-500/20">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-brand-100 font-semibold">Your Digital Token</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">NEXT UP</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white mt-2">CARD-03</div>
                    <p className="text-xs text-brand-100 mt-1">John Doe • Routine Checkup</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                    <span>Patients Ahead: <strong className="text-white">1</strong></span>
                    <span>Est. Wait: <strong className="text-white">15 mins</strong></span>
                  </div>
                </div>

                {/* Queue Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Upcoming in Queue</span>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-100">
                        <span className="font-bold text-slate-800">CARD-04</span>
                        <span className="text-slate-500">Sophia Patel</span>
                        <span className="text-amber-600 font-semibold">~30m</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-100 opacity-60">
                        <span className="font-bold text-slate-800">CARD-05</span>
                        <span className="text-slate-500">Scheduled</span>
                        <span className="text-slate-400">~45m</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500 text-center font-medium">
                    ⚡ Auto-synchronized via WebSockets
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Smart Features</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              Engineered for Frictionless Care
            </p>
            <p className="mt-4 text-slate-600">
              Transforming chaotic waiting rooms into streamlined digital queues with automated communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Live Virtual Queue Tracking</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Patients see their exact token number, number of patients ahead, and dynamic wait times calculated in real time. Wait from anywhere.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-brand-600 flex items-center gap-1">
                Zero waiting room congestion <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            <Card hover className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Contactless QR Check-In</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Every booked appointment receives a unique secure QR pass. Scan upon clinic arrival to auto-generate a queue token without touching kiosk screens.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-teal-600 flex items-center gap-1">
                Instant token generation <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            <Card hover className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Dedicated Physician Console</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Doctors call next patients, start consultations, record prescriptions, or mark no-shows with a single click. Connected in real time to the waiting room.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-indigo-600 flex items-center gap-1">
                Optimized clinical workflows <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600">Simple 3-Step Process</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              How QueueCare Works
            </p>
            <p className="mt-4 text-slate-600">
              A smooth journey from booking to consultation in 3 effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-subtle relative">
              <span className="text-4xl font-extrabold text-brand-100 absolute top-6 right-6">01</span>
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Book Doctor & Slot</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Choose department, doctor, and convenient time slot. Get an instant confirmation pass with QR check-in code.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-subtle relative">
              <span className="text-4xl font-extrabold text-teal-100 absolute top-6 right-6">02</span>
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Scan QR to Check In</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                On the day of your appointment, scan the clinic entrance QR or click check-in to enter the doctor's live queue.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-subtle relative">
              <span className="text-4xl font-extrabold text-indigo-100 absolute top-6 right-6">03</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Track Queue & Care</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Watch estimated wait time from your phone. Receive an instant alert when the doctor calls your token number.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section: Patients vs Doctors */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Patients */}
            <div className="rounded-3xl bg-brand-50/50 p-8 sm:p-10 border border-brand-100">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">For Patients</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">Ditch the Germy Waiting Room</h3>
              <p className="text-sm text-slate-600 mt-3">
                No more sitting for an hour in a crowded waiting room next to coughing strangers. Wait at a nearby café or in your car.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>Real-time notifications when your turn approaches</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>Accurate waiting time estimates based on real doctor pace</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                  <span>Permanent access to appointment history and prescriptions</span>
                </li>
              </ul>
            </div>

            {/* Doctors */}
            <div className="rounded-3xl bg-teal-50/50 p-8 sm:p-10 border border-teal-100">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">For Doctors & Clinics</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">Smooth, Predictable Consultations</h3>
              <p className="text-sm text-slate-600 mt-3">
                Maintain steady patient flow, reduce front-desk inquiries by 80%, and optimize consultation schedules.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>Single-click patient call with automatic waiting room display</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>Easy handling of late arrivals and skipped tokens</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>Comprehensive analytics on patient traffic and department volume</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-brand-400">72%</div>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">Reduction in Perceived Wait</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-teal-400">45k+</div>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">Appointments Managed</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-indigo-400">99.8%</div>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">Queue Sync Uptime</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold text-emerald-400">4.9 / 5</div>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">Patient Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Frequently Asked Questions</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900">Got Questions? We’ve Got Answers.</p>
          </div>

          <div className="space-y-4">
            <Card padding="p-6">
              <h4 className="text-base font-bold text-slate-900">How is the estimated waiting time calculated?</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                QueueCare uses dynamic calculations based on the number of patients waiting ahead of you in that specific doctor's queue multiplied by the doctor's average consultation duration, updated live whenever patients are called or completed.
              </p>
            </Card>

            <Card padding="p-6">
              <h4 className="text-base font-bold text-slate-900">What happens if a patient arrives late for their token?</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                If a patient doesn't enter the consultation room when called, the doctor can mark them as skipped. When the patient arrives, reception or the doctor can re-activate or bump their token back into the active queue.
              </p>
            </Card>

            <Card padding="p-6">
              <h4 className="text-base font-bold text-slate-900">Can patients check in using their phone?</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Yes! Every booking provides a digital pass with a QR code and a 4-digit PIN. Scanning the code with any smartphone camera instantly opens the check-in confirmation page and assigns a live token.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience Frictionless Clinic Care?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-100 max-w-xl mx-auto">
            Join thousands of patients and clinics who have transformed their healthcare experience with QueueCare.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-white text-brand-700 hover:bg-slate-100 shadow-xl">
                Create Free Patient Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Staff & Doctor Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
