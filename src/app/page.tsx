"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Trophy,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  X,
  Smartphone,
  CreditCard,
  Wallet,
  Target,
  Layers,
  EyeOff,
  LineChart,
  Plus,
  Minus,
  Bell,
  Clock,
  Rocket,
  Sparkles,
  ChevronDown,
} from "lucide-react";

// =====================================================================
//  Helper – count-down hook (locks to 30 June of current/next year)
// =====================================================================
function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      done: false,
      ready: false,
    };
  }

  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff === 0, ready: true };
}

// =====================================================================
//  Helper – fade / slide-up on scroll
// =====================================================================
function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: any;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

// =====================================================================
//  Phone mockup with a small Dynamic-Island-style notch
// =====================================================================
function PhoneFrame({
  src,
  alt,
  floatDelay = 0,
}: {
  src: string;
  alt: string;
  floatDelay?: number;
}) {
  return (
    <div
      className="relative mx-auto w-[280px] sm:w-[300px] animate-float motion-reduce:animate-none"
      style={{ animationDelay: `${floatDelay}ms` }}
    >
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl border-[1px] border-gray-800 ring-1 ring-white/5">
        {/* Small centred camera notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-20 ring-1 ring-gray-700/60 flex items-center justify-center">
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
        </div>

        <div className="relative bg-[#16202C] rounded-[2.4rem] overflow-hidden h-[600px]">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  Coming-soon modal (shown when login / sign-up clicked pre-launch)
// =====================================================================
function ComingSoonModal({
  open,
  onClose,
  countdown,
}: {
  open: boolean;
  onClose: () => void;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    ready: boolean;
  };
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadein"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#FED800]/30 bg-gradient-to-br from-[#16202C] via-[#0a0e27] to-[#16202C] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* shimmer */}
        <div className="pointer-events-none absolute inset-0 -z-0 bg-[linear-gradient(110deg,transparent_25%,rgba(254,216,0,0.08)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FED800] to-[#60991A] shadow-lg shadow-[#FED800]/30">
            <Rocket className="h-8 w-8 text-black" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">Coming Soon</h3>
          <p className="text-gray-300 mb-6">
            We&apos;re putting the finishing touches on PeerStake. Sign-ups open
            on <span className="text-[#FED800] font-semibold">30 June</span>.
          </p>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Mins", value: countdown.minutes },
              { label: "Secs", value: countdown.seconds },
            ].map((u) => (
              <div
                key={u.label}
                className="rounded-xl bg-white/5 border border-white/10 py-3"
              >
                <div className="text-2xl font-black text-[#FED800] tabular-nums">
                  {countdown.ready ? String(u.value).padStart(2, "0") : "--"}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">
                  {u.label}
                </div>
              </div>
            ))}
          </div>

          <a
            href="#early-access"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-[#FED800] to-[#ffd700] text-black font-bold rounded-full hover:scale-[1.02] transition-transform"
          >
            <Bell className="h-4 w-4" />
            Notify me at launch
          </a>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  Page
// =====================================================================
export default function LandingPage() {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Lock countdown target to 30 June 23:59:59 (current year, or next if past)
  const target = useMemo(() => {
    const now = new Date();
    let year = now.getFullYear();
    let t = new Date(year, 5, 30, 23, 59, 59); // month is 0-indexed → 5 = June
    if (t.getTime() < now.getTime()) {
      year += 1;
      t = new Date(year, 5, 30, 23, 59, 59);
    }
    return t;
  }, []);
  const countdown = useCountdown(target);

  const openModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowComingSoon(true);
  };

  // -------------------------------------------------------------------
  //  Static data
  // -------------------------------------------------------------------
  const stakeModes = [
    {
      id: "peer",
      icon: <Users className="w-6 h-6" />,
      title: "Peer-to-Peer Stakes",
      tagline: "1-on-1 with someone you know",
      description:
        "Challenge a friend, agree on terms, and let the platform hold the stake until the result is in. The classic PeerStake experience.",
      highlights: [
        "Direct challenge",
        "Shareable invite link",
        "Auto-settled payouts",
      ],
      image: "/screen_pic1.png",
      accent: "from-[#FED800] to-[#ffd700]",
      accentText: "text-[#FED800]",
      ring: "ring-[#FED800]/30",
    },
    {
      id: "pool",
      icon: <Layers className="w-6 h-6" />,
      title: "Pool Stakes",
      tagline: "Many players, one prize pool",
      description:
        "Several players put in to the same pool on the same outcome. Winners share the pot — bigger crowd, bigger payout.",
      highlights: ["Group payouts", "Live pool size", "Open or invite-only"],
      image: "/pool_image.jpg",
      accent: "from-[#60991A] to-[#7fbe24]",
      accentText: "text-[#60991A]",
      ring: "ring-[#60991A]/30",
    },
    {
      id: "public",
      icon: <EyeOff className="w-6 h-6" />,
      title: "Public Anonymous Stakes",
      tagline: "Stake against strangers, privately",
      description:
        "Post a stake to the public board and get matched with anyone in the world — no usernames, no chat, just the result.",
      highlights: ["Auto-matching", "Identity hidden", "Open marketplace"],
      image: "/public_stakes_page.jpg",
      accent: "from-purple-500 to-fuchsia-500",
      accentText: "text-purple-300",
      ring: "ring-purple-400/30",
    },
    {
      id: "markets",
      icon: <LineChart className="w-6 h-6" />,
      title: "Prediction Markets",
      tagline: "Buy YES or NO on real-world events",
      description:
        "Trade shares on the outcomes of matches, elections and trending events. Prices move with the crowd — sell anytime.",
      highlights: [
        "YES / NO shares",
        "Live order book",
        "Sell before settlement",
      ],
      image: "/markets_page.jpg",
      accent: "from-sky-400 to-cyan-500",
      accentText: "text-sky-300",
      ring: "ring-sky-400/30",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Instant Payouts",
      description: "Withdraw to M-Pesa the moment your stake settles.",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Escrow-Backed",
      description: "Stakes are held in escrow until the result is confirmed.",
    },
    {
      icon: <Trophy className="w-7 h-7" />,
      title: "Live & Pre-Match",
      description: "Stake on live games or markets that run for weeks.",
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: "Fair Resolution",
      description: "Multi-source result verification on every event.",
    },
  ];

  const journeySteps = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Sign up in seconds",
      desc: "Phone number, PIN, done. No paperwork.",
      color: "from-[#FED800] to-[#ffd700]",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Top up via M-Pesa",
      desc: "Deposit instantly. Visa & bank cards too.",
      color: "from-[#60991A] to-[#7fbe24]",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Pick your stake mode",
      desc: "1-on-1, pool, anonymous or prediction market.",
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Get paid instantly",
      desc: "Winnings hit your wallet the moment it settles.",
      color: "from-sky-400 to-cyan-500",
    },
  ];

  const faqs = [
    {
      q: "Is PeerStake legal in Kenya?",
      a: "PeerStake operates as a peer-to-peer staking platform. We do not act as a bookmaker — players stake against each other. We comply with applicable local regulations and require all players to be 18 or older.",
    },
    {
      q: "How are payouts handled?",
      a: "Every stake is held in escrow until the outcome is confirmed. As soon as the result is in, winnings are released straight to your in-app wallet — withdrawable to M-Pesa within seconds.",
    },
    {
      q: "Who decides who wins?",
      a: "For sports and live events, results come from independent data providers and are cross-checked. For prediction markets, settlement uses publicly verifiable sources tied to each market.",
    },
    {
      q: "What does it cost?",
      a: "It is free to join. PeerStake takes a small service fee on settled stakes — clearly shown before you confirm. There are no hidden charges.",
    },
    {
      q: "When is launch?",
      a: "Public sign-ups open on 30 June. Drop your number on the early-access list and we'll text you the moment the doors open.",
    },
  ];

  const tickerItems = [
    "KSh 500 staked on Bayern vs Stuttgart",
    "KSh 1,200 won on Arsenal to win",
    "New pool: 18 players on El Clásico",
    "KSh 200 on the 2027 election market",
    "Anonymous stake matched in 4s",
    "Market: Will it rain in Nairobi this weekend?",
    "KSh 750 won — payout in 3s",
    "New pool: 42 players on UFC main card",
    "KSh 300 on prediction: BTC > $80k by Friday",
  ];

  // -------------------------------------------------------------------
  //  Render
  // -------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16202C] to-[#0a0e27] text-white overflow-hidden">
      {/* ----------------------------------------------------------- */}
      {/*  Local animations                                            */}
      {/* ----------------------------------------------------------- */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-14px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 6s linear infinite;
        }

        @keyframes ctaglow {
          0%,
          100% {
            box-shadow:
              0 0 0 0 rgba(254, 216, 0, 0.55),
              0 10px 30px -5px rgba(254, 216, 0, 0.45);
          }
          50% {
            box-shadow:
              0 0 0 14px rgba(254, 216, 0, 0),
              0 10px 40px -5px rgba(254, 216, 0, 0.7);
          }
        }
        .animate-ctaglow {
          animation: ctaglow 2.4s ease-in-out infinite;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }

        @keyframes nudge {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(6px);
          }
        }
        .animate-nudge {
          animation: nudge 1.6s ease-in-out infinite;
        }

        @keyframes fadein {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadein {
          animation: fadein 0.25s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-shimmer,
          .animate-ctaglow,
          .animate-ticker,
          .animate-nudge,
          .animate-fadein {
            animation: none !important;
          }
        }
      `}</style>

      {/* Animated background blobs (original look) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FED800] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-[#60991A] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/*  18+ banner                                                  */}
      {/* ----------------------------------------------------------- */}
      <div className="relative z-50 bg-gradient-to-r from-amber-500/15 via-amber-400/15 to-amber-500/15 border-b border-amber-400/20 text-amber-200 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-2 text-center">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>
            <span className="font-bold">18+ only.</span> Stake responsibly —
            only stake what you can afford to lose.
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/*  Navigation                                                  */}
      {/* ----------------------------------------------------------- */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-lg bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-[#FED800]">.peer</span>
            <span className="text-white">stake</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#stake-modes"
              className="text-gray-300 hover:text-[#FED800] transition-colors"
            >
              Stake modes
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-[#FED800] transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-gray-300 hover:text-[#FED800] transition-colors"
            >
              Features
            </a>
            <a
              href="#faq"
              className="text-gray-300 hover:text-[#FED800] transition-colors"
            >
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              onClick={openModal}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              onClick={openModal}
              className="px-6 py-2 bg-gradient-to-r from-[#FED800] to-[#ffd700] text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-[#FED800]/20"
            >
              Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* ----------------------------------------------------------- */}
      {/*  Hero                                                        */}
      {/* ----------------------------------------------------------- */}
      <section className="relative z-10 pt-16 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#60991A]/20 border border-[#60991A]/30 rounded-full backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#60991A] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#60991A]"></span>
                  </span>
                  <span className="text-sm font-medium text-[#60991A]">
                    Launching 30 June — early access open
                  </span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                  <span className="text-white">Stake your way.</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#FED800] via-[#ffd700] to-[#60991A] bg-clip-text text-transparent">
                    Win your way.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-xl text-gray-400 max-w-xl">
                  PeerStake is the all-in-one staking platform. Go 1-on-1 with a
                  friend, jump into a shared pool, match anonymously, or trade
                  prediction markets — all in one app.
                </p>
              </Reveal>

              <Reveal delay={220}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/signup"
                    onClick={openModal}
                    className="group px-8 py-4 bg-gradient-to-r from-[#FED800] to-[#ffd700] text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 animate-ctaglow"
                  >
                    Get early access
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#stake-modes"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    See stake modes
                  </a>
                </div>
              </Reveal>

              {/* payment methods */}
              <Reveal delay={280}>
                <div className="inline-flex flex-wrap items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <span className="text-xs uppercase tracking-wider text-gray-400">
                    Top up with
                  </span>
                  <span className="px-3 py-1.5 rounded-md bg-[#1ea84a] text-white text-xs font-bold tracking-wide">
                    M-PESA
                  </span>
                  <span className="px-3 py-1.5 rounded-md bg-[#1a1f71] text-white text-xs font-black italic tracking-wider">
                    VISA
                  </span>
                  <span className="px-3 py-1.5 rounded-md bg-gradient-to-r from-[#eb001b] via-[#ff5f00] to-[#f79e1b] text-white text-xs font-bold tracking-wide">
                    Mastercard
                  </span>
                  <span className="px-3 py-1.5 rounded-md bg-white/10 text-gray-200 text-xs font-semibold flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Bank
                  </span>
                </div>
              </Reveal>

              <Reveal delay={340}>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  {[
                    "Instant withdrawals",
                    "Escrow protection",
                    "24/7 support",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#60991A]" />
                      <span className="text-sm text-gray-400">{t}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Hero phones */}
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#FED800] rounded-full blur-3xl opacity-20" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#60991A] rounded-full blur-3xl opacity-20" />
              <div className="relative grid grid-cols-2 gap-4">
                <Reveal>
                  <PhoneFrame
                    src="/markets_page.jpg"
                    alt="Markets"
                    floatDelay={0}
                  />
                </Reveal>
                <Reveal delay={150} className="mt-12">
                  <PhoneFrame
                    src="/market_detail_page_with_buy_dial_up.jpg"
                    alt="Market detail"
                    floatDelay={1500}
                  />
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  Social-proof ticker                                         */}
      {/* ----------------------------------------------------------- */}
      <section className="relative z-10 -mt-4 mb-16">
        <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.03] backdrop-blur-sm">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0e27] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0e27] to-transparent z-10" />

          <div className="flex items-center gap-3 py-3">
            <div className="shrink-0 pl-6 pr-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#60991A] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#60991A]"></span>
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Live activity
              </span>
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="flex gap-10 whitespace-nowrap animate-ticker">
                {[...tickerItems, ...tickerItems].map((t, i) => (
                  <span
                    key={i}
                    className="text-sm text-gray-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FED800]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  Stake modes                                                 */}
      {/* ----------------------------------------------------------- */}
      <section id="stake-modes" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FED800]/10 border border-[#FED800]/30 rounded-full text-xs text-[#FED800] uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FED800] animate-pulse" />{" "}
              Four ways to play
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pick the <span className="text-[#FED800]">stake mode</span> that
              fits the moment
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From a quick bet with a friend to a full-blown prediction market,
              PeerStake covers it all.
            </p>
          </Reveal>

          <div className="space-y-20">
            {stakeModes.map((mode, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <div
                  key={mode.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  <Reveal>
                    <div className="space-y-5">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs ${mode.accentText} uppercase tracking-wider`}
                      >
                        Mode {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.accent} text-black flex items-center justify-center shadow-lg`}
                        >
                          {mode.icon}
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black">
                          {mode.title}
                        </h3>
                      </div>
                      <p className={`text-lg font-semibold ${mode.accentText}`}>
                        {mode.tagline}
                      </p>
                      <p className="text-gray-400 text-base max-w-lg">
                        {mode.description}
                      </p>
                      <ul className="space-y-2 pt-2">
                        {mode.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex items-center gap-2 text-gray-300"
                          >
                            <CheckCircle
                              className={`w-4 h-4 ${mode.accentText}`}
                            />
                            <span className="text-sm">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>

                  <Reveal delay={120}>
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-[3rem] blur-3xl opacity-30 bg-gradient-to-br ${mode.accent}`}
                      />
                      <PhoneFrame
                        src={mode.image}
                        alt={mode.title}
                        floatDelay={idx * 400}
                      />
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  Prediction-market deep dive                                 */}
      {/* ----------------------------------------------------------- */}
      <section className="relative z-10 py-20 px-6 bg-white/[0.03]">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Prediction markets, end to end
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Browse open markets, dig into the details, and place a buy in two
              taps.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 items-end">
            {[
              {
                src: "/markets_page.jpg",
                title: "1. Browse markets",
                desc: "See trending markets and their live prices.",
              },
              {
                src: "/market_detail_page.jpg",
                title: "2. Open a market",
                desc: "Read the rules, check the order book, decide YES or NO.",
              },
              {
                src: "/market_detail_page_with_buy_dial_up.jpg",
                title: "3. Place your buy",
                desc: "Set the amount, confirm, and you're in.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <div className="relative">
                  <PhoneFrame
                    src={step.src}
                    alt={step.title}
                    floatDelay={i * 600}
                  />
                  <div className="mt-6 text-center">
                    <h4 className="text-lg font-bold text-white">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  How it works                                                */}
      {/* ----------------------------------------------------------- */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How it <span className="text-[#FED800]">works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From sign-up to payout in four short steps.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
            {journeySteps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="relative h-full p-6 bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl">
                  <div className="text-7xl font-black text-white/5 absolute top-2 right-4 leading-none select-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-black flex items-center justify-center mb-4 shadow-lg`}
                  >
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 relative">{s.title}</h3>
                  <p className="text-sm text-gray-400 relative">{s.desc}</p>

                  {i < journeySteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 text-[#FED800] animate-nudge" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  Features grid                                               */}
      {/* ----------------------------------------------------------- */}
      <section
        id="features"
        className="relative z-10 py-20 px-6 bg-white/[0.03]"
      >
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="text-[#FED800]">winners</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 80}>
                <div className="group h-full p-6 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#FED800]/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FED800]/20 to-[#60991A]/20 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-6">
                    <div className="text-[#FED800]">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  FAQ                                                         */}
      {/* ----------------------------------------------------------- */}
      <section id="faq" className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Quick <span className="text-[#FED800]">questions</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Everything early visitors usually ask before launch day.
            </p>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={f.q} delay={i * 60}>
                  <div className="border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] transition"
                    >
                      <span className="font-semibold text-white text-base sm:text-lg">
                        {f.q}
                      </span>
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full bg-[#FED800]/15 text-[#FED800] flex items-center justify-center transition-transform ${open ? "rotate-45" : ""}`}
                      >
                        {open ? (
                          <Minus className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        open
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                          {f.a}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  Launch countdown                                            */}
      {/* ----------------------------------------------------------- */}
      <section id="early-access" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative overflow-hidden p-10 md:p-14 bg-gradient-to-br from-[#FED800] via-[#ffd700] to-[#60991A] rounded-3xl shadow-2xl">
              {/* shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.25)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer" />

              <div className="relative text-center text-black">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/15 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                  <Clock className="w-3.5 h-3.5" />
                  Public launch — 30 June
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-3">
                  Be first in line.
                </h2>
                <p className="text-base md:text-lg text-black/80 mb-8 max-w-xl mx-auto">
                  Drop your number and we&apos;ll text you the moment sign-ups
                  open. Plus a small launch-day bonus on your first deposit.
                </p>

                <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto mb-8">
                  {[
                    { label: "Days", value: countdown.days },
                    { label: "Hours", value: countdown.hours },
                    { label: "Mins", value: countdown.minutes },
                    { label: "Secs", value: countdown.seconds },
                  ].map((u) => (
                    <div
                      key={u.label}
                      className="bg-black/85 text-white rounded-2xl py-4"
                    >
                      <div className="text-3xl sm:text-4xl font-black tabular-nums text-[#FED800]">
                        {countdown.ready
                          ? String(u.value).padStart(2, "0")
                          : "--"}
                      </div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mt-1">
                        {u.label}
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="/signup"
                  onClick={openModal}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-black text-white font-bold rounded-full hover:scale-105 transition-transform shadow-xl"
                >
                  <Bell className="w-4 h-4" />
                  Notify me at launch
                </a>

                <p className="mt-5 text-xs text-black/70 flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" /> 18+ only. Stake responsibly.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/*  Footer                                                      */}
      {/* ----------------------------------------------------------- */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-[#FED800]">Peer</span>
                <span className="text-white">Stake</span>
              </div>
              <p className="text-gray-400 text-sm">
                One platform, four ways to stake. Built in Kenya.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Stake modes</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#stake-modes" className="hover:text-[#FED800]">
                    Peer-to-peer
                  </a>
                </li>
                <li>
                  <a href="#stake-modes" className="hover:text-[#FED800]">
                    Pool stakes
                  </a>
                </li>
                <li>
                  <a href="#stake-modes" className="hover:text-[#FED800]">
                    Public anonymous
                  </a>
                </li>
                <li>
                  <a href="#stake-modes" className="hover:text-[#FED800]">
                    Prediction markets
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-[#FED800]">
                    About
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#FED800]">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#FED800]">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-[#FED800]">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#FED800]">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#FED800]">
                    Responsible play
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm space-y-2">
            <p>© 2025 PeerStake. All rights reserved.</p>
            <p className="text-xs">
              <span className="font-bold text-amber-300">18+ only.</span> Stake
              responsibly. Only stake what you can afford to lose.
            </p>
            <p className="text-xs pt-2 text-gray-500">
              A <span className="font-semibold text-[#FED800]">techwithjohn</span> creation
            </p>
          </div>
        </div>
      </footer>

      {/* ----------------------------------------------------------- */}
      {/*  Coming-soon modal                                           */}
      {/* ----------------------------------------------------------- */}
      <ComingSoonModal
        open={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        countdown={countdown}
      />

      {/* unused import shim — keeps tree-shake happy if hooks change */}
      <span className="hidden">
        <ChevronDown />
      </span>
    </div>
  );
}
