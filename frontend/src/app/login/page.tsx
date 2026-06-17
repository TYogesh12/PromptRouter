"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (isLogin) {
                // Log the user in
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push("/chat"); // Send to the main chat page!
            } else {
                // Sign the user up
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Success! Check your email or sign in.");
                setIsLogin(true);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);

            } else {
                setError("An unknown error occurred");

            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 relative overflow-hidden">
            {/* Global Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />

            {/* The Floating Card */}
            <div className="relative z-10 w-full max-w-sm p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">

                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center text-emerald-400 font-bold text-xl mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                        ⚡
                    </div>
                    <h1 className="text-[26px] font-extrabold tracking-tight text-white mb-2 font-headline">
                        NexusAI
                    </h1>
                    <p className="text-[13px] font-medium tracking-wide text-zinc-500">
                        {isLogin ? "Welcome back, Curator." : "Create your account."}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    {error && (
                        <div className="p-4 text-[13px] font-semibold text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    {/* Input Group */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-2.5 px-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-5 py-3.5 text-[15px] bg-white/[0.03] text-slate-100 rounded-xl border border-white/5 focus:border-emerald-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all duration-300 placeholder:text-zinc-600 font-medium"
                                placeholder="example@mail.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between px-1 mb-2.5">
                                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-5 py-3.5 pr-12 text-[15px] bg-white/[0.03] text-slate-100 rounded-xl border border-white/5 focus:border-emerald-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all duration-300 placeholder:text-zinc-600 font-medium tracking-widest"
                                    placeholder="Your Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Primary Action Button */}
                    <button
                        type="submit"
                        className="w-full py-4 text-[15px] font-bold tracking-wide text-slate-950 bg-emerald-500 rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                    >
                        {isLogin ? "Sign In" : "Sign Up"}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center pt-6 border-t border-white/5">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[13px] font-semibold text-zinc-500 hover:text-emerald-400 transition-colors"
                    >
                        {isLogin ? "Need an account? Sign Up." : "Already have an account? Sign In."}
                    </button>
                </div>
            </div>
        </div>
    );
}
