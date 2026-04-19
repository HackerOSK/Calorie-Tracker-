"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Camera,
  ChefHat,
  Pill,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Leaf,
} from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-light/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 to-primary-light/5 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Diet Tracking
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-2xl shadow-primary/30">
              <Leaf className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            Track Your Calories
            <br />
            <span className="gradient-text">With AI Magic</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Just snap a photo of your meal and let AI detect every calorie.
            Get personalized Indian recipe suggestions, track vitamins, and
            achieve your nutrition goals effortlessly.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-primary-foreground font-semibold text-base hover:opacity-90 transition-all shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-border bg-card/50 text-foreground font-semibold text-base hover:bg-card hover:border-primary/30 transition-all"
            >
              <Camera className="w-5 h-5" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Everything You Need for{" "}
            <span className="gradient-text">Healthy Living</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete nutrition companion designed for Indian diets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {[
            {
              icon: Camera,
              title: "AI Meal Scanner",
              desc: "Upload a meal photo and our AI instantly detects calories, protein, carbs, and fats.",
              gradient: "from-emerald-500 to-green-400",
            },
            {
              icon: ChefHat,
              title: "Indian Recipes",
              desc: "Browse curated recipes filtered by your macro targets and available ingredients.",
              gradient: "from-amber-500 to-orange-400",
            },
            {
              icon: Pill,
              title: "Vitamin Tracker",
              desc: "Never miss a supplement. Track your daily vitamins with a simple checklist.",
              gradient: "from-purple-500 to-violet-400",
            },
            {
              icon: BarChart3,
              title: "Smart Analytics",
              desc: "Visualize your nutrition trends with beautiful charts and actionable insights.",
              gradient: "from-blue-500 to-cyan-400",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-6 hover:shadow-lg hover:shadow-glow transition-all duration-300 group glow-card"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center">
          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
            {[
              { icon: Shield, label: "100% Private" },
              { icon: Zap, label: "AI Powered" },
              { icon: Sparkles, label: "Free to Use" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Ready to take control of your diet?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Your data is securely stored in the cloud. Sign up in seconds and access from any device.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-primary-foreground font-semibold text-base hover:opacity-90 transition-all shadow-xl shadow-primary/25"
          >
            Start Tracking Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold gradient-text">
            CalTracker
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          AI-Powered Diet & Nutrition Tracker • Built with 💚
        </p>
      </footer>
    </div>
  );
}
