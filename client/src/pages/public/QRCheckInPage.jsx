import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, KeyRound, CheckCircle2, ArrowRight, Clock, Users, Building, AlertCircle } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import toast from 'react-hot-toast';

export const QRCheckInPage = () => {
  const [appointmentId, setAppointmentId] = useState('');
  const [pin, setPin] = useState('');
  const [qrRaw, setQrRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const navigate = useNavigate();

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!appointmentId && !qrRaw && !pin) {
      toast.error('Please enter your Appointment ID or QR Data, or PIN');
      return;
    }

    try {
      setLoading(true);
      const res = await appointmentService.checkInByQR({
        appointmentId: appointmentId.trim(),
        pin: pin.trim(),
        qrData: qrRaw.trim(),
      });

      setCheckInResult(res.data);
      toast.success(res.message || 'Check-in verified!');
    } catch (err) {
      toast.error(err.message || 'Check-in failed. Please verify PIN or appointment details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-[85vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
            <QrCode className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Contactless Clinic Check-In
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Arrived at the clinic? Enter your 4-digit PIN or Appointment Code below to receive your live queue token.
          </p>
        </div>

        {checkInResult ? (
          <Card padding="p-8" className="border-2 border-teal-500 shadow-xl animate-in zoom-in-95">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Check-In Verified
              </span>
              <h2 className="text-2xl font-bold text-slate-900">You Are In The Queue!</h2>
              <p className="text-xs text-slate-500 mt-1">Please keep this token handy.</p>
            </div>

            {/* Generated Token Display */}
            <div className="rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-600 text-white p-6 text-center shadow-lg mb-6">
              <span className="text-xs uppercase tracking-wider text-brand-100 font-semibold">Your Digital Token</span>
              <div className="text-5xl font-black mt-2 tracking-tight">
                {checkInResult.tokenNumber || checkInResult.appointment?.tokenNumber}
              </div>
              <p className="text-sm text-brand-100 mt-2 font-medium">
                {checkInResult.appointment?.patient?.name || 'Patient'}
              </p>
            </div>

            {/* Queue Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Currently Serving</span>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {checkInResult.queue?.currentServingToken || 'Preparing'}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Total In Queue</span>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {checkInResult.queue?.totalWaiting || 1}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() =>
                  navigate(
                    `/queue/${
                      checkInResult.appointment?.doctor?._id ||
                      checkInResult.appointment?.doctor
                    }`
                  )
                }
              >
                Track Live Queue <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => setCheckInResult(null)}
              >
                Check In Another
              </Button>
            </div>
          </Card>
        ) : (
          <Card padding="p-6 sm:p-8">
            <form onSubmit={handleCheckIn} className="space-y-5">
              <Input
                label="Appointment ID or Reference"
                placeholder="e.g. 673db8... or scan pass"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                helperText="Found on your digital appointment pass or email confirmation"
              />

              <Input
                label="4-Digit Check-In PIN"
                icon={KeyRound}
                maxLength={4}
                placeholder="e.g. 1984"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                helperText="The security PIN printed on your appointment pass"
              />

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Or Paste QR Payload
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                <textarea
                  rows={2}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
                  placeholder='{"appId":"...","pin":"..."}'
                  value={qrRaw}
                  onChange={(e) => setQrRaw(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="teal"
                size="lg"
                loading={loading}
                className="w-full shadow-md shadow-teal-500/20"
              >
                <QrCode className="w-5 h-5" /> Verify & Enter Queue
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500">
              <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                Tip: You can also check in directly with one click from the <strong>My Appointments</strong> tab inside your logged-in patient portal!
              </span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRCheckInPage;
