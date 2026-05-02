import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PillIcon, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, register, isLoading, error } = useAuthStore();
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const [tenantName, setTenantName] = useState('PharmEZ Demo');
    const [phone, setPhone] = useState('');
    const [gstNumber, setGstNumber] = useState('');
    const [email, setEmail] = useState('admin@pharmez.in');
    const [password, setPassword] = useState('Admin@123');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (mode === 'login') {
                await login(email, password);
                toast.success('Authentication successful. Welcome back!');
            } else {
                await register({
                    tenantName,
                    email,
                    password,
                    phone: phone || undefined,
                    gstNumber: gstNumber || undefined,
                });
                toast.success('Account created successfully. You are now signed in.');
            }
            navigate('/dashboard');
        } catch (err: any) {
            const isNetworkError = !err?.response && (err?.code === 'ERR_NETWORK' || /network|fetch/i.test(String(err?.message || '')));
            if (isNetworkError) {
                toast.error('Unable to reach backend. Start backend on http://localhost:3000 and retry.');
            } else {
                toast.error(err.response?.data?.error || 'Authentication failed');
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0e1a] flex flex-col md:flex-row overflow-hidden font-sans text-text-1">
            {/* Background Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Left Section: Branding & Visuals (Hidden on small screens) */}
            <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 border-r border-[#1a2640] bg-[#0d1424]/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary/20">
                        <PillIcon size={20} color="white" />
                    </div>
                    <span className="font-display font-bold text-2xl tracking-tight text-white">PharmIQ++</span>
                </div>

                <div className="max-w-md">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-4xl font-display font-bold text-white leading-tight mb-6"
                    >
                        Precision control for modern modern pharmacies.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-text-2 text-lg leading-relaxed"
                    >
                        Manage your inventory, accelerate point-of-sale operations, and leverage AI-driven insights—all from one secure command center.
                    </motion.p>
                </div>

                {/* Decorative UI Element / Glass Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute right-[-40px] top-[30%] w-80 bg-[#111827]/80 backdrop-blur-xl border border-[#1f2d45] rounded-2xl p-5 shadow-2xl skew-y-3 transform -rotate-2"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                            </div>
                            <span className="text-sm font-medium">System Status</span>
                        </div>
                        <span className="text-xs text-text-3 font-mono">Real-time</span>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full bg-success w-[92%]" />
                        </div>
                        <div className="h-2 w-3/4 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[75%]" />
                        </div>
                        <div className="h-2 w-5/6 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full bg-info w-[88%]" />
                        </div>
                    </div>
                </motion.div>

                <div className="text-sm text-text-8">
                    Made with ❤️ by TY AIML-B Group 11 - 2026
                </div>
            </div>

            {/* Right Section: Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center gap-3 mb-10 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary/20">
                            <PillIcon size={20} color="white" />
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tight text-white">PharmIQ++</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-display font-bold text-white mb-2">
                            {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
                        </h2>
                        <p className="text-text-2 text-sm">
                            {mode === 'login'
                                ? 'Enter your credentials to access the terminal.'
                                : 'Register your pharmacy tenant and admin account.'}
                        </p>
                        <div className="mt-4 inline-flex rounded-lg border border-[#1f2d45] bg-[#0d1424]/60 p-1">
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${mode === 'login' ? 'bg-primary text-white' : 'text-text-2 hover:text-text-1'}`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('register')}
                                className={`px-3 py-1.5 text-sm rounded-md transition ${mode === 'register' ? 'bg-primary text-white' : 'text-text-2 hover:text-text-1'}`}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'register' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-2">Pharmacy / Tenant Name</label>
                                    <input
                                        type="text"
                                        value={tenantName}
                                        onChange={(e) => setTenantName(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-[#1f2d45] rounded-xl leading-5 bg-[#0d1424]/50 text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                                        placeholder="PharmIQ Demo Store"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text-2">Phone</label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="block w-full px-3 py-2.5 border border-[#1f2d45] rounded-xl leading-5 bg-[#0d1424]/50 text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text-2">GST Number</label>
                                        <input
                                            type="text"
                                            value={gstNumber}
                                            onChange={(e) => setGstNumber(e.target.value)}
                                            className="block w-full px-3 py-2.5 border border-[#1f2d45] rounded-xl leading-5 bg-[#0d1424]/50 text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text-2">Work Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-text-3" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-[#1f2d45] rounded-xl leading-5 bg-[#0d1424]/50 text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-text-2">Password</label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-3" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-[#1f2d45] rounded-xl leading-5 bg-[#0d1424]/50 text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm tracking-widest font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-primary hover:bg-primary-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0e1a] focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_24px_rgba(59,130,246,0.25)] hover:shadow-[0_0_36px_rgba(59,130,246,0.4)]"
                        >
                            {/* Button subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    {mode === 'login' ? 'Authenticating...' : 'Creating account...'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    {mode === 'login' ? 'Sign In to Workspace' : 'Create Workspace'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>


                </motion.div>
            </div>
        </div>
    );
}
