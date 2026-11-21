import React from 'react';
import { Card } from '../../components/common/Card';
import { ShieldCheck, Heart, Users, Clock, Award, CheckCircle } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-16 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Our Story</span>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Revolutionizing the Outpatient Experience
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            QueueCare was founded by healthcare professionals and software engineers tired of seeing patients suffer through unpredictable, stress-inducing clinic wait times.
          </p>
        </div>

        {/* Mission Card */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-teal-600 p-8 sm:p-12 text-white shadow-xl mb-14">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="mt-3 text-brand-100 text-base sm:text-lg leading-relaxed max-w-3xl">
            To provide transparent, predictable, and respectful healthcare experiences where patients own their time, doctors maintain focused schedules, and clinic lobbies operate with digital elegance.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card padding="p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Respect for Time</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every minute a patient spends in an overcrowded waiting room is a minute lost. We make wait times dynamic and predictable.
            </p>
          </Card>

          <Card padding="p-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Privacy & Security</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              We uphold the highest healthcare data security standards, ensuring personal health information is never compromised.
            </p>
          </Card>

          <Card padding="p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Compassionate Tech</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Technology should simplify clinical visits for patients of all ages, from toddlers visiting pediatrics to seniors visiting cardiology.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
