import { motion } from 'framer-motion';
import { PillIcon, Star, CheckCircle, Zap, Shield, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0e1a] text-text-1 font-sans overflow-y-auto selection:bg-primary/30">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-[#1a2640]">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary/20">
                            <PillIcon size={16} color="white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-white">PharmIQ++</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-semibold bg-primary hover:bg-primary-dim text-white px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-primary/20"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                {/* Background ambient glows */}
                <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Copy */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827]/80 backdrop-blur-sm border border-[#1f2d45] mb-8 shadow-sm"
                        >
                            <Star className="w-4 h-4 text-primary fill-primary" />
                            <span className="text-xs font-semibold tracking-wide text-primary uppercase">#1 Pharmacy Software in India</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-[68px] font-display font-extrabold text-white leading-[1.05] mb-6 tracking-tight"
                        >
                            Smart Inventory & <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6]">
                                Billing Software
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg lg:text-xl text-text-2 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            PharmIQ++ helps you manage your pharmacy inventory, generate GST bills, and track expiry dates—all in one place. Designed for speed, security, and simplicity.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
                        >
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-primary hover:bg-primary-dim text-white text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_rgba(59,130,246,0.3)] hover:shadow-[0_0_32px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5"
                            >
                                Login to Workspace
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center lg:justify-start gap-8 text-sm text-text-3 font-medium"
                        >
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#2dd4bf]" /> No credit card required</div>
                            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#2dd4bf]" /> 1-Branch free access</div>
                        </motion.div>
                    </div>

                    {/* Right Graphic / Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex-1 relative w-full max-w-2xl lg:max-w-none perspective-1000"
                    >
                        <div className="relative rounded-2xl bg-[#111827] border border-[#1f2d45] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden aspect-[16/10] transform lg:rotate-y-[-10deg] lg:rotate-z-[-2deg] hover:rotate-y-0 hover:rotate-z-0 transition-all duration-700">
                            {/* Browser Header Mac style */}
                            <div className="h-10 border-b border-[#1f2d45] bg-[#0d1424] flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                <div className="ml-4 flex-1 mr-8 bg-[#1a2640]/50 rounded-md h-6 flex items-center justify-center text-[10px] text-text-3 font-mono border border-[#1f2d45]">
                                    app.pharmiq.in/dashboard
                                </div>
                            </div>

                            {/* Dummy Dashboard UI inside the mockup */}
                            <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 h-full bg-[#0a0e1a]">
                                {/* Top stats cards */}
                                <div className="flex gap-4">
                                    <div className="w-1/3 sm:w-48 h-20 sm:h-24 rounded-xl bg-[#111827] border border-[#1a2640] p-3 sm:p-4 flex flex-col justify-between">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/20 flex items-center justify-center"><LineChart className="w-3 h-3 sm:w-4 sm:h-4 text-primary" /></div>
                                        <div>
                                            <div className="text-[10px] sm:text-xs text-text-3 font-medium">Today's Sales</div>
                                            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">₹ 42,500</div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-1 h-24 rounded-xl bg-[#111827] border border-[#1a2640] p-4 items-center gap-4">
                                        <div className="w-12 h-12 rounded-full border-4 border-[#2dd4bf]/20 border-t-[#2dd4bf] animate-[spin_3s_linear_infinite]" />
                                        <div>
                                            <div className="text-sm font-semibold text-white">System Synchronised</div>
                                            <div className="text-xs text-[#2dd4bf]">All branches online</div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Assistant Input Mock */}
                                <div className="w-full rounded-xl bg-[#111827] border border-[#1a2640] p-3 flex items-center gap-3">
                                    <Star className="w-4 h-4 text-[#2dd4bf]" />
                                    <div className="text-xs text-text-3 flex-1 font-mono">Ask AI about your pharmacy data...</div>
                                    <div className="w-6 h-6 rounded bg-[#1a2640] flex items-center justify-center text-[10px] text-text-2">↵</div>
                                </div>

                                {/* Table Mock */}
                                <div className="flex-1 rounded-xl bg-gradient-to-br from-[#111827] to-[#0d1424] border border-[#1a2640] p-4 sm:p-5 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-xs sm:text-sm font-semibold text-white">Recent Transactions</div>
                                        <div className="text-[10px] sm:text-xs text-primary font-medium">View All</div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-[#1a2640]/50 last:border-0">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="h-2 w-16 sm:w-24 bg-[#1f2d45] rounded" />
                                                    <div className="h-1.5 w-12 sm:w-16 bg-[#1a2640] rounded" />
                                                </div>
                                                <div className="h-3 sm:h-4 w-10 sm:w-16 bg-[#2dd4bf]/20 rounded border border-[#2dd4bf]/30" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Overlay reflection / glare */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Preview Section - to ensure scrolling */}
            <section id="features" className="py-24 bg-[#0d1424] border-t border-[#1a2640]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Everything you need to run a modern pharmacy</h2>
                        <p className="text-text-2 max-w-2xl mx-auto">Stop using outdated tools. PharmIQ++ brings cloud scalability, AI-assisted procurement, and split-second POS billing.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Lightning Fast POS", desc: "Process bills in seconds with keyboard-first workflows, barcode scanning, and auto-batch mapping." },
                            { icon: Shield, title: "Schedule H Compliance", desc: "Automated hard-blocks for prescription drugs, integrated audits, and real-time alerts." },
                            { icon: LineChart, title: "Intelligent Procurement", desc: "OCR invoice scanning, predictive stock ordering, and ML-assisted vendor comparisons." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-[#111827] border border-[#1f2d45] rounded-2xl p-8 hover:border-primary/50 transition-colors shadow-lg">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-text-2 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[#1a2640] bg-[#0a0e1a]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PillIcon size={20} className="text-primary" />
                        <span className="font-display font-bold text-lg text-white">PharmIQ++</span>
                    </div>
                    <div className="text-sm text-text-8">
                        Made with ❤️ by TY AIML-B Group 11 - 2026
                    </div>
                </div>
            </footer>
        </div>
    );
}
