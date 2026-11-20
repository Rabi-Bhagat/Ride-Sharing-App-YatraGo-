import React, { useState } from 'react';
import { Globe, Smartphone, HelpCircle, ChevronDown, Check } from 'lucide-react';
import yatraGoLogo from '../logo/yatrago-logo.webp';

export default function YatraGoFooter({ onNavigate }) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLangModal, setShowLangModal] = useState(false);

  const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bangla', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ur', name: 'Urdu', native: 'اردو' }
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header: Brand + Help Center Link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-cyan-500/40 flex items-center justify-center">
              <img src={yatraGoLogo} alt="YatraGo Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList?.add('img-fallback'); }} />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">YatraGo</span>
              <p className="text-[10px] text-slate-400 font-mono">Zero-Emission Urban & Intercity Transit</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('guiders')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all font-bold"
          >
            <HelpCircle size={15} className="text-cyan-400" />
            <span>Visit Help Center & Safety Hub</span>
          </button>
        </div>

        {/* 4-Column Directory Grid (YatraGo Structure) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: Company */}
          <div className="space-y-3">
            <strong className="text-sm font-black text-white block">Company</strong>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">About us</button></li>
              <li><button onClick={() => onNavigate('book')} className="hover:text-white transition-colors">Our offerings</button></li>
              <li><button onClick={() => onNavigate('stranger')} className="hover:text-white transition-colors">How pooling works</button></li>
              <li><button onClick={() => onNavigate('preview-3d')} className="hover:text-white transition-colors">3D Route Preview</button></li>
              <li><button onClick={() => onNavigate('login')} className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">Sign In / Account Portal</button></li>
              <li><button onClick={() => onNavigate('signup')} className="hover:text-white transition-colors">Register as Traveler/Driver</button></li>
            </ul>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-3">
            <strong className="text-sm font-black text-white block">Products</strong>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('book')} className="hover:text-white transition-colors">YatraGo Ride (Daily Cab)</button></li>
              <li><button onClick={() => onNavigate('stranger')} className="hover:text-white transition-colors">YatraGo Pool (Save 44%)</button></li>
              <li><button onClick={() => onNavigate('cost-split')} className="hover:text-white transition-colors">Group Rides & Fare Split</button></li>
              <li><button onClick={() => onNavigate('guiders')} className="hover:text-white transition-colors">Local Guider Network</button></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Courier & Parcel Delivery</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">YatraGo for Business</span></li>
            </ul>
          </div>

          {/* Column 3: Global Citizenship */}
          <div className="space-y-3">
            <strong className="text-sm font-black text-white block">Global Citizenship</strong>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('sos')} className="hover:text-rose-400 transition-colors">Emergency Safety Protocol</button></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Government ID Verification</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Zero-Carbon Sustainability</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Driver Safety Standards</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">24/7 Incident Hotline</span></li>
            </ul>
          </div>

          {/* Column 4: Travel Corridors */}
          <div className="space-y-3">
            <strong className="text-sm font-black text-white block">Travel & Corridors</strong>
            <ul className="space-y-2">
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Delhi Airport (DEL)</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Mumbai Airport (BOM)</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Bengaluru Airport (BLR)</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Mumbai ⇄ Pune Expressway</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">Delhi ⇄ Mathura Intercity</span></li>
              <li><span className="text-slate-400 hover:text-white cursor-pointer">15,000+ Smart Cities</span></li>
            </ul>
          </div>

        </div>

        {/* Language Selector + Download Badges */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-slate-900">
          
          {/* Language Selector Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLangModal(!showLangModal)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition-all font-bold"
            >
              <Globe size={15} className="text-cyan-400" />
              <span>{selectedLanguage}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              Location: India (IN) • Global Fleet
            </span>
          </div>

          {/* App Store Download Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white hover:border-slate-700 cursor-pointer transition-all">
              <Smartphone size={18} className="text-cyan-400" />
              <div className="text-left">
                <span className="text-[9px] uppercase text-slate-400 block font-mono">Download on</span>
                <strong className="text-xs font-bold block">App Store & Google Play</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Language Modal (Dropdown) */}
        {showLangModal && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fadeIn">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.name);
                  setShowLangModal(false);
                }}
                className={`p-2 rounded-xl text-left flex items-center justify-between transition-all ${
                  selectedLanguage === lang.name
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{lang.name} ({lang.native})</span>
                {selectedLanguage === lang.name && <Check size={14} className="text-cyan-400" />}
              </button>
            ))}
          </div>
        )}

        {/* Legal & Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-900/60 text-slate-400 text-[11px]">
          <p>© 2026 YatraGo Technologies Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Notice</span>
            <span className="hover:text-white cursor-pointer transition-colors">Accessibility</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Do Not Sell My Info</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

