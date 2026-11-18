import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Can I have a lost item or package delivered to me?',
    a: 'Yes. YatraGo Courier provides on-demand same-day parcel delivery across town. Whether it’s forgotten keys, documents, groceries, or a birthday gift, choose the Courier service option and track your courier messenger in real-time with live GPS.'
  },
  {
    q: 'Can I request a ride that picks up friends in different locations?',
    a: 'Yes! Group Rides and Stranger Matching in YatraGo allow multiple pickup waypoints. Friends who ride together save together: you can invite co-riders, view individual fare breakdowns, and automatically split the total bill via UPI, Card, or Wallet.'
  },
  {
    q: 'Is there a YatraGo ride option for 5 to 7 people?',
    a: 'Request YatraGo XL or EcoSUV Pool for a spacious SUV or high-capacity electric van that comfortably accommodates up to 6–7 passengers with ample luggage trunk capacity. It is ideal for family outings, airport runs, or group travel.'
  },
  {
    q: 'Can I request an Auto, Moto, or Electric Cab on YatraGo?',
    a: 'Yes. YatraGo makes it seamless to request YatraGo Moto (motorcycle), YatraGo Auto (electric moped/rickshaw), or YatraGo Premier (luxury EV sedan). There is no need to hail cabs on the street: request doorstep pickup at the tap of a button.'
  },
  {
    q: 'How does Carpool & Shared Rides save up to 44%?',
    a: 'Our smart route alignment matches you with verified commuters traveling along the same route. By sharing vehicle seats, your fare is cut by up to 44% with verified co-riders.'
  },
  {
    q: 'Can I schedule a ride in advance?',
    a: 'Yes! With YatraGo Reserve, you can schedule a ride up to 90 days in advance. It includes complimentary wait time (up to 15 mins at standard locations, 45 mins at airports) and 100% free cancellation up to 60 minutes prior.'
  },
  {
    q: 'What safety features are active during my trip?',
    a: 'Every ride is protected by comprehensive safety features: mandatory Government ID verification for all riders & drivers, 4-digit ride start PIN, live GPS route sharing with trusted contacts, and an instant 3-second Emergency SOS button.'
  }
];

export default function UberFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-6 pt-4">
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle size={15} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Got Questions?</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Everything you need to know about riding, pooling, reserving, and safety on YatraGo.
        </p>
      </div>

      <div className="divide-y divide-slate-800 rounded-3xl bg-slate-900/60 border border-slate-800 p-2 sm:p-4">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-3 px-3 sm:px-4">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between text-left py-2 gap-4 group cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {faq.q}
                </span>
                <div className={`p-1.5 rounded-full bg-slate-800 text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shrink-0 ${
                  isOpen ? 'rotate-180 bg-cyan-500 text-slate-950' : ''
                }`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              {isOpen && (
                <div className="pt-2 pb-3 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

