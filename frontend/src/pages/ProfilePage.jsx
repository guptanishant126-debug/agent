import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  PhoneCall,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLang, setPreferredLang] = useState(user?.preferred_language || language || 'en');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        name,
        phone,
        preferred_language: preferredLang
      });
      setLanguage(preferredLang);
      setSuccessMsg('Your profile and language preferences have been updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <User className="w-3.5 h-3.5" />
          <span>Citizen Settings</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal details, AI response language, and emergency security configurations.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl animate-fadeIn">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-xl animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number (for SMS Alerts)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address (Account Identifier)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Preferred Spoken & Written Regional Language
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Gemini 2.5 Flash will reason and structure all advisory plans and audio narrations in this language.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Critical Emergency Contacts Directory */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <PhoneCall className="w-5 h-5 text-red-600" />
          <span>Verified Government Helplines (Direct Tap to Dial)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                24x7 Toll Free
              </span>
              <ShieldCheck className="w-4 h-4 text-red-700" />
            </div>
            <h4 className="text-sm font-bold text-red-950">National Cyber Crime Helpline</h4>
            <p className="text-xs text-red-800">
              For unauthorized bank debits, UPI QR fraud, or loan app extortion. Call within 2 hours.
            </p>
            <a
              href="tel:1930"
              className="inline-flex items-center space-x-1.5 text-xs font-black text-red-900 hover:underline pt-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial 1930</span>
            </a>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                6 AM - 10 PM
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="text-sm font-bold text-emerald-950">Kisan Call Centre (KCC)</h4>
            <p className="text-xs text-emerald-800">
              Free expert agronomist guidance on crop diseases, pest outbreaks, MSP, and weather.
            </p>
            <a
              href="tel:18001801551"
              className="inline-flex items-center space-x-1.5 text-xs font-black text-emerald-900 hover:underline pt-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial 1800-180-1551</span>
            </a>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded">
                Consumer Forum
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-700" />
            </div>
            <h4 className="text-sm font-bold text-blue-950">National Consumer Helpline</h4>
            <p className="text-xs text-blue-800">
              Defective equipment, counterfeit fertilizers, withheld refunds, and retail disputes.
            </p>
            <a
              href="tel:1915"
              className="inline-flex items-center space-x-1.5 text-xs font-black text-blue-900 hover:underline pt-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial 1915</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

