import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7faf8] px-4 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(247,250,248,0.92)_42%,_rgba(241,247,244,1)_100%)]" />
            <div className="absolute -left-24 bottom-[-8rem] h-64 w-64 rounded-full bg-emerald-100/70 blur-2xl" />
            <div className="absolute -right-20 top-[-5rem] h-56 w-56 rounded-full bg-cyan-100/60 blur-2xl" />

            <div className="relative z-10 w-full max-w-[520px] rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-6">
                <div className="mb-3 text-center">
                    <Link href="/" className="inline-flex items-center justify-center text-xs font-medium text-slate-500 transition hover:text-slate-700">
                        Retour a l'accueil
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
