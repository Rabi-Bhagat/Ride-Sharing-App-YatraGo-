import React, { useState } from 'react';
import { 
  Sparkles, Users, HeartHandshake, Compass, IndianRupee, 
  Smile, ShieldCheck, ArrowRight, CheckCircle2, Zap, Brain, MessageSquare
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';

export default function AiTravelMatchmaker({ onSelectMatch, onOpenChat }) {
  const [selectedMood, setSelectedMood] = useState('tech'); // 'tech', 'quiet', 'explorer', 'budget'
  const [selectedInterests, setSelectedInterests] = useState(['Podcasts', 'Eco-Tech']);
  const [budgetLimit, setBudgetLimit] = useState(300);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const MOOD_OPTIONS = [
    { id: 'tech', label: 'Tech & Networking', desc: 'Connect with founders, devs & tech innovators en route', icon: '💻' },
    { id: 'quiet', label: 'Quiet & Relaxed', desc: 'Low noise, soothing transit with podcast listeners', icon: '🎧' },
    { id: 'explorer', label: 'Sightseeing & Culture', desc: 'Tourists & explorers visiting landmarks together', icon: '🧭' },
    { id: 'budget', label: 'Maximum Fare Savings', desc: 'Optimize route matching to slash up to 45% of fare', icon: '⚡' }
  ];

  const INTEREST_TAGS = [
    'Podcasts', 'Eco-Tech', 'AI & Startups', 'Photography', 
    'Music & Lo-Fi', 'Urban Design', 'Books', 'Fitness'
  ];

  const AI_CANDIDATES = [
    {
      id: 'ai_1',
      name: 'Sarah Jenkins',
      role: 'Biotech Researcher & Podcast Host',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      compatibilityScore: 98,
      matchingInterests: ['Podcasts', 'Eco-Tech', 'Books'],
      suggestedCorridor: 'Innovation Tech Park ➔ Downtown Cyber Hub Plaza',
      estimatedFareShare: 180,
      originalFare: 320,
      savingsPercent: 44,
      vibeMatchReason: 'Shares your exact preference for tech conversations, verified ID, and daily commute corridor.',
      trustBadge: 'Government Verified ID',
      rating: 4.98
    },
    {
      id: 'ai_2',
      name: 'David Vance',
      role: 'Software Engineer & Minimalist',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      compatibilityScore: 94,
      matchingInterests: ['AI & Startups', 'Music & Lo-Fi'],
      suggestedCorridor: 'Cyber Harbor Viaduct ➔ Oceanfront Bay Pier',
      estimatedFareShare: 190,
      originalFare: 320,
      savingsPercent: 40,
      vibeMatchReason: 'Quiet commuter with high route alignment along Highway 101.',
      trustBadge: 'Gold Verified Rider',
      rating: 4.89
    },
    {
      id: 'ai_3',
      name: 'Priya Sundaram',
      role: 'Product Designer & Travel Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      compatibilityScore: 92,
      matchingInterests: ['Urban Design', 'Photography', 'Books'],
      suggestedCorridor: 'Metro Skyway Interchange ➔ Historic Cultural District',
      estimatedFareShare: 160,
      originalFare: 290,
      savingsPercent: 45,
      vibeMatchReason: 'Interested in exploring 3D architectural landmarks and city hubs.',
      trustBadge: 'Government Verified ID',
      rating: 4.95
    }
  ];

  const toggleInterest = (tag) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const handleRunAiMatch = () => {
    setIsMatching(true);
    setMatchResult(null);
    setTimeout(() => {
      setIsMatching(false);
      setMatchResult(AI_CANDIDATES);
    }, 900);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-black text-white">Smart Co-Rider Matchmaker</h3>
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
            Verified Community
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Find compatible passengers traveling along your route based on shared commute preferences, interests, and your desired fare in Indian Rupees (₹).
        </p>
      </div>

      {/* Input Parameters: Mood, Interests, Budget */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Mood Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            1. Select Your Commute Mood & Vibe:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MOOD_OPTIONS.map(m => {
              const isSelected = selectedMood === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-2xl">{m.icon}</div>
                  <div>
                    <strong className="text-xs font-bold block text-white">{m.label}</strong>
                    <p className="text-[11px] text-slate-400 leading-snug mt-1">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interests Multi-Select Chips */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            2. Common Interests & Topics:
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map(tag => {
              const isChecked = selectedInterests.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                    isChecked
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-400 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Limit Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold uppercase tracking-wider text-slate-300">
              3. Maximum Desired Fare per Person:
            </label>
            <span className="font-mono font-black text-emerald-400 text-sm">₹{budgetLimit}</span>
          </div>
          <input
            type="range"
            min={100}
            max={600}
            step={20}
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>₹100 (High Pooling)</span>
            <span>₹350 (Balanced)</span>
            <span>₹600 (Express Solo)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunAiMatch}
          disabled={isMatching}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 text-slate-950 font-black text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isMatching ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
              <span>Matching compatible co-riders along route...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Find Compatible Travel Companions</span>
            </>
          )}
        </button>

      </div>

      {/* AI Match Results */}
      {matchResult && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white">
              Recommended Co-Riders ({matchResult.length} Found)
            </h4>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Sorted by Route & Preferences
            </span>
          </div>

          <div className="space-y-3">
            {matchResult.map(candidate => (
              <div
                key={candidate.id}
                className="glass-panel p-5 rounded-3xl border border-purple-500/30 hover:border-cyan-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Profile + Match Score */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-400"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-500 text-slate-950 font-mono text-[9px] font-black shadow">
                      {candidate.compatibilityScore}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-black text-white">{candidate.name}</strong>
                      <VerificationBadge type={candidate.trustBadge} size="sm" />
                      <span className="text-xs text-amber-400 font-bold">{candidate.rating} ★</span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{candidate.role}</p>

                    <p className="text-xs text-purple-300 bg-purple-500/10 p-2 rounded-xl border border-purple-500/20 mt-1.5 leading-relaxed">
                      💡 <strong>Vibe Match:</strong> {candidate.vibeMatchReason}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-400">Interests:</span>
                      {candidate.matchingInterests.map(i => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Savings & Action */}
                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 self-end md:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold block">
                      Save {candidate.savingsPercent}% (₹{candidate.estimatedFareShare} share)
                    </span>
                    <span className="text-[11px] text-slate-500 line-through font-mono">
                      Original: ₹{candidate.originalFare}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenChat && onOpenChat()}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 transition-all cursor-pointer"
                      title="Send In-App Message"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button
                      onClick={() => onSelectMatch && onSelectMatch(candidate)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <HeartHandshake size={15} />
                      <span>Pair & Pool Ride</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
