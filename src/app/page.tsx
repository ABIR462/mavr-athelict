"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/SplashScreen";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, Globe, Lock, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getStoredUserId, setStoredUserId } from "@/lib/clientSession";

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const login = useMutation(api.auth.login);

  useEffect(() => {
    if (getStoredUserId()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const userId = await login({ email, password });
      setStoredUserId(userId);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-mavr-bg"
        >
          {/* Decorative background gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-mavr-red rounded-full mix-blend-screen filter blur-[120px] opacity-10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-mavr-red rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s'}}></div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full max-w-md z-10"
          >
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-20 h-20 mb-4 drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                <Image src="/logo.png" alt="MAVR Logo" fill className="object-contain" />
              </div>
              <h1 className="text-3xl font-outfit font-light tracking-wider text-white">
                Welcome to <span className="font-bold tracking-[0.2em] ml-1">MAVR</span>
              </h1>
              <p className="text-mavr-muted mt-2 text-sm">Login to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mavr-muted group-focus-within:text-mavr-red transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-mavr-muted focus:outline-none focus:border-mavr-red/50 focus:bg-white/10 transition-all duration-300"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mavr-muted group-focus-within:text-mavr-red transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-mavr-muted focus:outline-none focus:border-mavr-red/50 focus:bg-white/10 transition-all duration-300"
                  required
                />
              </div>

              <div className="flex justify-end w-full">
                <a href="#" className="text-xs text-mavr-muted hover:text-white transition-colors">Forgot password?</a>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-6 bg-mavr-red hover:bg-mavr-red-hover text-white font-medium rounded-2xl flex items-center justify-center space-x-2 transition-colors shadow-[0_0_20px_rgba(229,9,20,0.4)]"
              >
                <span>{isSubmitting ? "Signing in..." : "Login"}</span>
              </motion.button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-mavr-bg px-4 text-mavr-muted">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {[Globe, ShieldCheck, Apple].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex justify-center items-center py-3 border border-white/10 rounded-2xl bg-white/5 transition-colors"
                  >
                    <Icon size={20} className="text-white" />
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-8 text-center text-xs text-mavr-muted">
                Don&apos;t have an account? <a href="#" className="text-white hover:text-mavr-red transition-colors ml-1">Sign Up</a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
