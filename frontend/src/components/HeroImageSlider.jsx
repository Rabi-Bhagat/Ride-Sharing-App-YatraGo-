import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2, 
  Sparkles, ArrowRight, ShieldCheck, MapPin, Layers, Radio,
  Clock, Zap, CheckCircle2, Eye, Compass
} from 'lucide-react';

export const HERO_IMAGES = [
  {
    id: 0,
    src: '/hero-images/hero-main.png',
    title: 'Next-Gen Urban Transit',
    subtitle: 'Connecting Commuters Across Smart City Corridors',
    tag: 'FLAGSHIP MOBILITY',
    stat: '44% Pool Savings',
    color: '#06b6d4',
    location: 'Cyber Harbor Suspension Bridge'
  },
  {
    id: 1,
    src: '/hero-images/hero-slide-1.png',
    title: 'High-Speed Highway Cruiser',
    subtitle: 'Seamless Zero-Emission Long Range Commutes',
    tag: 'ELECTRIC HIGHWAY',
    stat: '100% Zero-Carbon',
    color: '#38bdf8',
    location: 'Alpine Ridge Highway Summit'
  },
  {
    id: 2,
    src: '/hero-images/hero-slide-2.png',
    title: 'Hyper-Agile City Transit',
    subtitle: 'Bypass Rush-Hour Congestion With Verified Drivers',
    tag: 'RAPID DISPATCH',
    stat: '< 3 Min Pickup',
    color: '#10b981',
    location: 'Downtown Innovation Tech Park'
  },
  {
    id: 3,
    src: '/hero-images/hero-slide-3.png',
    title: 'Smart Roadways & Telemetry',
    subtitle: 'Dynamic Route Optimization and Fleet Analytics',
    tag: 'SMART NAVIGATION',
    stat: 'AI Route Sync',
    color: '#f59e0b',
    location: 'Oceanfront Bay Highline Viaduct'
  },
  {
    id: 4,
    src: '/hero-images/hero-slide-4.png',
    title: 'Zero-Emission Urban Living',
    subtitle: 'Clean Sustainable Mobility for Modern Commuters',
    tag: 'ECO FLEET',
    stat: '38.4 Tons Offset',
    color: '#06b6d4',
    location: 'Metro Cyber Interchange 101'
  },
  {
    id: 5,
    src: '/hero-images/hero-slide-5.png',
    title: 'Enterprise Safety Architecture',
    subtitle: 'Government ID Verified Riders & Instant SOS Beacon',
    tag: 'VERIFIED SAFETY',
    stat: '99.4% Verified',
    color: '#ef4444',
    location: 'Central Safety Response Beacon'
  },
  {
    id: 6,
    src: '/hero-images/hero-slide-6.png',
    title: 'Dynamic Stranger Ride Pooling',
    subtitle: 'Intelligent Waypoint Matching with Co-Riders',
    tag: 'SHARED TRANSIT',
    stat: 'Split Up to 45%',
    color: '#8b5cf6',
    location: 'West End Terminal Corridor'
  },
  {
    id: 7,
    src: '/hero-images/hero-slide-7.png',
    title: 'Metro Skyway Network',
    subtitle: 'Express Inter-City Highway Transit Hubs',
    tag: 'METRO EXPRESS',
    stat: '24/7 Availability',
    color: '#14b8a6',
    location: 'Metro Airport Skyway Express'
  }
];

export default function HeroImageSlider({ onBookRideWithRoute, onSelectSlide }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transitionEffect, setTransitionEffect] = useState('kenburns'); // 'kenburns', 'slide', 'fade'
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const autoPlayDuration = 5000; // 5 seconds per slide

  // Pre-load images into cache
  useEffect(() => {
    HERO_IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    setProgress(0);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    setProgress(0);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setProgress(0);
    if (onSelectSlide) {
      onSelectSlide(HERO_IMAGES[index]);
    }
  };

  // Autoplay and countdown progress bar
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const progressStep = (stepMs / autoPlayDuration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isHovered, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  const activeImage = HERO_IMAGES[currentIndex];

  const handleBook = () => {
    if (onBookRideWithRoute) {
      onBookRideWithRoute({
        waypoint: activeImage.location,
        slideTitle: activeImage.title
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-3xl overflow-hidden glass-panel border border-cyan-500/40 shadow-2xl transition-all duration-500 select-none ${
        isFullscreen ? 'fixed inset-4 z-50 bg-slate-950 flex flex-col' : 'w-full h-[580px] sm:h-[620px]'
      }`}
    >
      {/* ======================================================== */}
      {/* IMAGE STACK WITH TRANSITION EFFECTS                      */}
      {/* ======================================================== */}
      <div className="relative w-full h-full overflow-hidden bg-slate-950">
        {HERO_IMAGES.map((img, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length;

          // Transition styling based on active effect
          let transformClasses = 'scale-100 translate-x-0';
          if (transitionEffect === 'kenburns') {
            transformClasses = isActive ? 'scale-105 duration-[8000ms]' : 'scale-100 duration-700';
          } else if (transitionEffect === 'slide') {
            if (isActive) transformClasses = 'translate-x-0 duration-700';
            else if (isPrev) transformClasses = '-translate-x-full duration-700';
            else transformClasses = 'translate-x-full duration-700';
          }

          return (
            <div
              key={img.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={img.src}
                alt={img.title}
                className={`w-full h-full object-cover transition-transform ease-out ${transformClasses}`}
                loading={index < 2 ? 'eager' : 'lazy'}
              />

              {/* Cinematic Vignette & Lighting Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
            </div>
          );
        })}

        {/* Ambient Animated Cyber Sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none animate-pulse" />
      </div>

      {/* ======================================================== */}
      {/* TOP STATUS BAR: LOCATION, SLIDE COUNTER, TRANSITION PICKER */}
      {/* ======================================================== */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-20 pointer-events-none">
        
        {/* Active Location & Status Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-xl shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
              {activeImage.tag}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-white text-xs font-extrabold">
            <MapPin size={13} className="text-cyan-400 shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-[280px]">{activeImage.location}</span>
          </div>

          <span className="hidden sm:inline text-[9px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 font-bold">
            {activeImage.stat}
          </span>
        </div>

        {/* Controls: Transition Effect, Play/Pause, Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Transition Style Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl">
            <button
              onClick={() => setTransitionEffect('kenburns')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                transitionEffect === 'kenburns'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ken Burns Cinematic Zoom Transition"
            >
              Zoom
            </button>
            <button
              onClick={() => setTransitionEffect('slide')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                transitionEffect === 'slide'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Smooth Slide Transition"
            >
              Slide
            </button>
            <button
              onClick={() => setTransitionEffect('fade')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                transitionEffect === 'fade'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pure Crossfade Transition"
            >
              Fade
            </button>
          </div>

          {/* Play/Pause & Fullscreen Controls */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
              title={isPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
              title="Toggle Fullscreen View"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>

          {/* Slide Indicator Counter */}
          <div className="px-3 py-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl text-xs font-mono font-bold text-slate-300">
            <span className="text-cyan-400">{currentIndex + 1}</span>
            <span className="text-slate-500"> / </span>
            <span>{HERO_IMAGES.length}</span>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* PREVIOUS / NEXT FLOATING ARROW BUTTONS                   */}
      {/* ======================================================== */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
        title="Previous Image (Left Arrow)"
      >
        <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
        title="Next Image (Right Arrow)"
      >
        <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* ======================================================== */}
      {/* BOTTOM OVERLAY: CAPTION, ACTION CTA & THUMBNAILS         */}
      {/* ======================================================== */}
      <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3 pointer-events-none">
        
        {/* Caption & Instant Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl pointer-events-auto">
          
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                {activeImage.tag}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ✓ Live Route Corridor
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeImage.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeImage.subtitle}
            </p>
          </div>

          {/* Quick Action CTA */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleBook}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <span>Instant Dispatch Route</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>

        {/* Thumbnail Preview Strip & Transition Timer Bar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* 8 Thumbnail Previews */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl flex-1 overflow-x-auto no-scrollbar">
            {HERO_IMAGES.map((img, i) => {
              const isSelected = i === currentIndex;
              return (
                <button
                  key={img.id}
                  onClick={() => goToSlide(i)}
                  className={`relative shrink-0 h-11 w-16 sm:w-20 rounded-xl overflow-hidden transition-all duration-300 border ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105 shadow-md'
                      : 'border-slate-800/80 opacity-60 hover:opacity-100 hover:border-slate-600'
                  }`}
                  title={`${img.title} (${i + 1} of ${HERO_IMAGES.length})`}
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Circular/Linear Progress Timer Bar */}
          <div className="hidden md:flex items-center px-3 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl shrink-0 gap-2 font-mono text-xs text-slate-300">
            <Clock size={13} className={isPlaying ? 'text-cyan-400 animate-spin' : 'text-slate-500'} />
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

