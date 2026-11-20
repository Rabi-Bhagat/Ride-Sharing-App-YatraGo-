import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, X, Bot, User, MapPin, ShieldCheck, ArrowRight, ThumbsUp, ThumbsDown, RefreshCw, Loader2, BrainCircuit } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'How does fare splitting work?',
  'What is the cheapest way to travel?',
  'How do I book a ride?',
  'Is my ride safe at night?',
  'How does stranger pooling work?',
  'What if a driver does not arrive?'
];

// Domain knowledge used to answer rider questions about YatraGo itself.
const KNOWLEDGE = [
  {
    keys: ['split', 'fare split', 'cost-split', 'share the fare', 'divide', 'pool cost'],
    answer:
      'Fare splitting lets a group share one ride. Open Group Rides & Fare Split, add each co-rider (equal, custom or by-distance mode), then each person pays only their share. Every payment is verified with Razorpay and you get a receipt per rider.'
  },
  {
    keys: ['cheap', 'cheapest', 'save', 'saving', 'discount', 'budget', 'lowest fare'],
    answer:
      'The cheapest option is Pool / Stranger Pooling — matching you with co-riders on the same corridor saves up to 44%. Moto (bike) tiers are also cheaper than cars, and promo codes such as POOL44 and VELO20 give an extra ₹80 off.'
  },
  {
    keys: ['book', 'booking', 'request a ride', 'how to ride', 'order ride'],
    answer:
      'Enter your pickup and destination in the Request a Ride card, choose Ride, Pool, Reserve or Moto, pick a vehicle tier, then tap the request button. You will be matched with a verified driver and can track them live on the map.'
  },
  {
    keys: ['safe', 'safety', 'sos', 'emergency', 'night', 'women', 'verify', 'verified'],
    answer:
      'Every driver passes a Government ID verification check. Tap SOS in the navbar to broadcast an emergency alert with your GPS location, which also notifies your saved emergency contacts. All in-app calls and chats are proxied, so your phone number is never shared.'
  },
  {
    keys: ['pool', 'stranger', 'carpool', 'co-rider', 'share ride'],
    answer:
      'Stranger pooling pairs you with verified riders heading along the same corridor. The AI matchmaker scores route alignment, so you keep most of your savings while sharing the trip. Accept a match from the Stranger Pooling page, then split the fare.'
  },
  {
    keys: ['driver', 'not arriving', 'late', 'delay', 'cancel', 'refund'],
    answer:
      'If a driver is delayed, open the ride chat to message them directly. You can cancel before pickup at no charge. If a verified payment needs a refund, contact the Safety Command Desk from the chat page and the team resolves it against the Razorpay payment ID.'
  },
  {
    keys: ['reserve', 'schedule', 'later', 'advance', 'book ahead'],
    answer:
      'Use Reserve to schedule a ride up to 90 days ahead. Pick a date and time in the pickup selector and the request is dispatched to a driver before your slot, with complimentary wait time included.'
  },
  {
    keys: ['payment', 'pay', 'razorpay', 'upi', 'card', 'wallet'],
    answer:
      'You can pay by Razorpay (UPI, cards, netbanking, wallets), YatraGo Wallet balance, or direct UPI. Every Razorpay payment is signature-verified server-side before your ride is marked paid. Wallet top-ups go straight to your balance.'
  },
  {
    keys: ['moto', 'bike', 'scooter', 'superbike'],
    answer:
      'Moto tiers include YatraGo Moto Classic, HyperBike 1200R and AeroScooter EV. They are the fastest way through city traffic and every ride includes a helmet.'
  },
  {
    keys: ['guider', 'guide', 'tour', 'sightsee', 'landmark'],
    answer:
      'Verified local guiders can join your ride to show you heritage sites, food streets and hidden gems. Browse the Guider Directory, pick a specialist for your city, and add them to your booking.'
  },
  {
    keys: ['3d', 'preview', 'map', 'route preview'],
    answer:
      'The 3D Route Preview on the home page follows the pickup and destination you search, drawing the real driving path on a tilted satellite map. The full 3D hub also includes an interactive drive simulator.'
  },
  {
    keys: ['contact', 'support', 'help', 'human', 'agent', 'problem', 'issue'],
    answer:
      'The 24/7 Safety Command Desk is reachable from the Chat page, and the Help Center is linked in the footer. For anything urgent mid-trip, use the SOS button in the navbar.'
  }
];

function buildAnswer(question, route) {
  const q = String(question || '').toLowerCase().trim();
  const routeBits = [];
  if (route?.pickup?.name) routeBits.push(route.pickup.name);
  if (route?.destination?.name) routeBits.push(route.destination.name);

  if (/(this|my|current) (route|trip|ride)/.test(q) || q.includes('how far') || q.includes('how long')) {
    if (routeBits.length === 2) {
      return `For your current search — ${routeBits[0]} to ${routeBits[1]} — an Eco Sedan typically runs about ₹${(60 + 8.4 * 16.5).toFixed(0)} with an ETA near 13 minutes. Pooling the same corridor cuts roughly 44% off that fare, and a Moto is the cheapest solo option.`;
    }
    return 'Enter both a pickup and a destination in the ride card and I can estimate the fare and ETA for that exact route.';
  }

  if (q.includes('fare') || q.includes('price') || q.includes('cost') || q.includes('estimate')) {
    if (routeBits.length === 2) {
      return `For ${routeBits[0]} to ${routeBits[1]}, expect roughly ₹${(60 + 8.4 * 16.5).toFixed(0)} for an Eco Sedan. Premium SUVs, Moto and Pool tiers are priced differently — Pool saves up to 44%.`;
    }
    return 'Fares combine a base fare plus a per-km rate for your chosen tier. Share your pickup and destination (or type "this route") and I can give a closer estimate.';
  }

  const match = KNOWLEDGE.find(entry => entry.keys.some(k => q.includes(k)));
  if (match) return match.answer;

  if (routeBits.length === 2) {
    return `I do not have a specific answer for that yet. For your current route (${routeBits.join(' → ')}), I can help with fares, ETA, pooling savings, safety, payments and scheduling. Try rephrasing, or tap a suggestion below.`;
  }

  return 'I can answer questions about fares, pooling, safety, payments, reservations, guiders and 3D route previews. Try rephrasing, or tap a suggestion below.';
}

export default function YatraGoAiAssistant({ route }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('idle'); // 'idle' | 'thinking' | 'streaming'
  const [messages, setMessages] = useState([
    {
      id: 'greet',
      from: 'ai',
      text: 'Hi! I am your YatraGo travel assistant. Ask me anything about fares, pooling, safety, payments or your current route.'
    }
  ]);
  const bodyRef = useRef(null);
  const streamTimerRef = useRef(null);

  // Keep the newest message in view as the conversation grows
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, phase, open]);

  useEffect(() => () => clearInterval(streamTimerRef.current), []);

  const ask = (rawText) => {
    const text = String(rawText || '').trim();
    if (!text || phase !== 'idle') return;

    setMessages(prev => [...prev, { id: 'u_' + Date.now(), from: 'user', text }]);
    setInput('');
    setPhase('thinking');

    setTimeout(() => {
      const answer = buildAnswer(text, route);
      const messageId = 'a_' + Date.now();

      // Insert the bubble empty, then reveal the answer progressively
      setMessages(prev => [...prev, { id: messageId, from: 'ai', text: '', streaming: true }]);
      setPhase('streaming');

      let cursor = 0;
      const step = Math.max(2, Math.ceil(answer.length / 90));
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = setInterval(() => {
        cursor = Math.min(answer.length, cursor + step);
        const shown = answer.slice(0, cursor);
        const done = cursor >= answer.length;
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, text: shown, streaming: !done } : m))
        );
        if (done) {
          clearInterval(streamTimerRef.current);
          setPhase('idle');
        }
      }, 16);
    }, 700);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  const rateMessage = (id, feedback) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, feedback } : m)));
  };

  const resetConversation = () => {
    clearInterval(streamTimerRef.current);
    setPhase('idle');
    setInput('');
    setMessages([
      {
        id: 'greet_' + Date.now(),
        from: 'ai',
        text: 'Conversation reset. Ask me anything about fares, pooling, safety, payments or your current route.'
      }
    ]);
  };

  const hasRoute = Boolean(route?.pickup?.name || route?.destination?.name);
  const busy = phase !== 'idle';

  return (
    <>
      {/* ========================================================= */}
      {/* FLOATING LAUNCHER                                          */}
      {/* ========================================================= */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-30 flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs transition-all duration-300 hover:scale-[1.04] active:scale-95 animate-fadeIn"
          aria-label="Open YatraGo AI travel assistant"
          title="Ask YatraGo AI"
        >
          {/* Animated orb */}
          <span className="relative w-9 h-9 rounded-xl bg-slate-950/95 text-cyan-300 flex items-center justify-center shrink-0 overflow-hidden">
            <span className="absolute inset-0 rounded-xl animate-aiOrbit bg-gradient-to-tr from-cyan-400/60 via-transparent to-emerald-400/60"></span>
            <Sparkles size={15} className="relative animate-pulse" />
          </span>
          <span className="leading-none text-left">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider opacity-70 block">YatraGo AI</span>
            <span className="text-xs">Ask anything</span>
          </span>
          <span className="absolute inset-0 rounded-2xl animate-aiGlowPulse pointer-events-none"></span>
        </button>
      )}

      {/* ========================================================= */}
      {/* ASSISTANT PANEL                                            */}
      {/* ========================================================= */}
      {open && (
        <div className="fixed bottom-5 right-5 z-30 w-[23rem] max-w-[calc(100vw-2.5rem)] rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden animate-aiPanelIn">
          
          {/* Header with ambient sweep */}
          <div className="relative flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-slate-900 border-b border-slate-800 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent animate-aiShimmer"></div>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30">
                <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30"></span>
                <BrainCircuit size={17} className={busy ? 'animate-pulse' : ''} />
              </div>
              <div className="min-w-0">
                <strong className="text-xs font-black text-white block leading-tight">YatraGo AI Assistant</strong>
                <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {phase === 'thinking' ? 'Analysing your question…' : phase === 'streaming' ? 'Answering…' : 'Online · rides & travel help'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={resetConversation}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Reset conversation"
                title="Start a new conversation"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Close assistant"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Live route context strip */}
          {hasRoute && (
            <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 text-[10px] font-mono text-slate-300 overflow-hidden">
              <MapPin size={11} className="text-cyan-400 shrink-0" />
              <span className="truncate">{route.pickup?.name || 'Pickup'}</span>
              <ArrowRight size={10} className="text-slate-500 shrink-0" />
              <span className="text-emerald-400 truncate">{route.destination?.name || 'Destination'}</span>
            </div>
          )}

          {/* Conversation */}
          <div ref={bodyRef} className="max-h-72 overflow-y-auto px-3.5 py-3 space-y-2.5 no-scrollbar">
            {messages.map((m, index) => (
              <div
                key={m.id}
                style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
                className={`flex items-end gap-2 animate-aiMessageIn ${m.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  m.from === 'user'
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {m.from === 'user' ? <User size={11} /> : <Bot size={11} />}
                </span>

                <div className={`group relative max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed transition-all duration-200 ${
                  m.from === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none hover:border-cyan-500/30'
                }`}>
                  {m.text}
                  {m.streaming && (
                    <span className="inline-block w-1.5 h-3 ml-0.5 bg-cyan-300 animate-aiCaret align-middle rounded-sm"></span>
                  )}

                  {/* Answer feedback on completed AI replies */}
                  {m.from === 'ai' && !m.streaming && index !== 0 && (
                    <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-800/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {m.feedback ? (
                        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                          <ThumbsUp size={9} />
                          Thanks for the feedback
                        </span>
                      ) : (
                        <>
                          <span className="text-[9px] font-mono text-slate-500 mr-1">Helpful?</span>
                          <button
                            onClick={() => rateMessage(m.id, 'up')}
                            className="p-1 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                            aria-label="Mark answer helpful"
                          >
                            <ThumbsUp size={10} />
                          </button>
                          <button
                            onClick={() => rateMessage(m.id, 'down')}
                            className="p-1 rounded-md text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                            aria-label="Mark answer unhelpful"
                          >
                            <ThumbsDown size={10} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {phase === 'thinking' && (
              <div className="flex items-center gap-2 animate-aiMessageIn">
                <span className="w-5 h-5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot size={11} />
                </span>
                <div className="px-3 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 rounded-bl-none flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{ animationDelay: `${i * 140}ms` }}
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-aiTypingDot"
                    />
                  ))}
                  <span className="text-[10px] font-mono text-slate-400 ml-1">YatraGo AI is thinking</span>
                  <Loader2 size={10} className="animate-spin text-cyan-400" />
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
              <button
                key={prompt}
                onClick={() => ask(prompt)}
                disabled={busy}
                style={{ animationDelay: `${i * 60}ms` }}
                className="text-[9px] font-mono font-bold px-2 py-1 rounded-full bg-slate-900 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-40 animate-aiMessageIn"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={onSubmit} className="p-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fares, safety, pooling…"
              className="flex-1 h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
              aria-label="Ask YatraGo AI a question"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              className={`w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:hover:scale-100`}
              aria-label="Send question"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>

          {/* Safety footnote */}
          <div className="px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-500 border-t border-slate-800/80">
            <ShieldCheck size={10} className="text-emerald-400" />
            <span>Instant answers from YatraGo help content</span>
          </div>
        </div>
      )}
    </>
  );
}
