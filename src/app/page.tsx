"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Shield, Users, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '10K+', label: 'Active Players' },
    { value: '₹2M+', label: 'Won Today' },
    { value: '99.9%', label: 'Uptime' }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Betting',
      description: 'Place bets in seconds with our lightning-fast platform'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Fair',
      description: 'Bank-grade encryption and verified fair play'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Live Matches',
      description: 'Bet on live games with real-time odds updates'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Challenge Friends',
      description: 'Create private bets and compete with friends'
    }
  ];

  const testimonials = [
    { name: 'Alex K.', text: 'Best betting platform I\'ve used. The UI is smooth and payouts are instant!', wins: '₹45,000' },
    { name: 'Priya M.', text: 'Love the friend challenges feature. Makes betting so much more fun!', wins: '₹28,500' },
    { name: 'Raj S.', text: 'Fast, secure, and transparent. Everything a betting app should be.', wins: '₹67,200' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16202C] to-[#0a0e27] text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FED800] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-[#60991A] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 backdrop-blur-lg bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-[#FED800]">.bet</span>
            <span className="text-white">yetu</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-[#FED800] transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-[#FED800] transition-colors">How It Works</a>
            <a href="#testimonials" className="text-gray-300 hover:text-[#FED800] transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Login
            </a>
            <a href="/signup" className="px-6 py-2 bg-gradient-to-r from-[#FED800] to-[#ffd700] text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-[#FED800]/20">
              Sign Up
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#60991A]/20 border border-[#60991A]/30 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 bg-[#60991A] rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-[#60991A]">Live Now - 247 Active Matches</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                  <span className="text-white">Bet Smart.</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#FED800] via-[#ffd700] to-[#60991A] bg-clip-text text-transparent">
                    Win Big.
                  </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-xl">
                  Join thousands of winners on Kenya's most trusted peer-to-peer betting platform. 
                  Challenge friends, bet on live matches, and withdraw instantly.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/signup" className="group px-8 py-4 bg-gradient-to-r from-[#FED800] to-[#ffd700] text-black font-bold rounded-full hover:scale-105 transition-all shadow-2xl shadow-[#FED800]/30 flex items-center justify-center gap-2">
                  Start Betting Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#how-it-works" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#60991A]" />
                  <span className="text-sm text-gray-400">Instant Withdrawals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#60991A]" />
                  <span className="text-sm text-gray-400">Verified Fair Play</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#60991A]" />
                  <span className="text-sm text-gray-400">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image with Stats */}
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="aspect-[4/5] bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm flex items-center justify-center">
                  <img 
                    src="/landing_page.png" 
                    alt="BetYetu Platform" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                      <div 
                        key={index}
                        className={`text-center transition-all duration-500 ${
                          currentStat === index ? 'scale-110' : 'scale-100 opacity-60'
                        }`}
                      >
                        <div className="text-2xl font-bold bg-gradient-to-r from-[#FED800] to-[#60991A] bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#FED800] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#60991A] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-[#FED800]">BetYetu?</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the future of peer-to-peer betting with features designed for winners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#FED800]/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#FED800]/20 to-[#60991A]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-[#FED800]">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start Betting in <span className="text-[#FED800]">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account in under 60 seconds' },
              { step: '02', title: 'Deposit', desc: 'Add funds via M-Pesa or bank transfer' },
              { step: '03', title: 'Win Big', desc: 'Place bets and withdraw your winnings instantly' }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-black text-[#FED800]/10 absolute -top-6 left-0">
                  {item.step}
                </div>
                <div className="relative pt-12 p-8 bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-8 w-6 h-6 text-[#FED800]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="text-[#FED800]">Winners Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#FED800]/50 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#FED800]">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-[#60991A] font-bold">{testimonial.wins} Won</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-r from-[#FED800] to-[#60991A] rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
              Ready to Start Winning?
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Join 10,000+ players already winning on BetYetu
            </p>
            <a href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-black text-white font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-[#FED800]">.bet</span>
                <span className="text-white">yetu</span>
              </div>
              <p className="text-gray-400 text-sm">
                Kenya's most trusted peer-to-peer betting platform
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#FED800]">Features</a></li>
                <li><a href="#" className="hover:text-[#FED800]">Pricing</a></li>
                <li><a href="#" className="hover:text-[#FED800]">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#FED800]">About</a></li>
                <li><a href="#" className="hover:text-[#FED800]">Careers</a></li>
                <li><a href="#" className="hover:text-[#FED800]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#FED800]">Terms</a></li>
                <li><a href="#" className="hover:text-[#FED800]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#FED800]">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>© 2025 BetYetu. All rights reserved. Bet responsibly.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}