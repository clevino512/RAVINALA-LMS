import { useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { usePage } from '@inertiajs/react';

export default function AppLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { props } = usePage();
    const flash = props.flash;

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f7faf8_0%,#f4f8f6_100%)] text-dark-900">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="lg:pl-72">
                <header className="sticky top-0 z-30 flex min-h-20 shrink-0 items-center gap-4 border-b border-emerald-100 bg-white/85 px-4 shadow-sm backdrop-blur-md sm:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-xl p-2 text-dark-500 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    {header && <div className="flex-1">{header}</div>}
                </header>

                {flash?.success && (
                    <div className="mx-4 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm sm:mx-6">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-sm sm:mx-6">
                        {flash.error}
                    </div>
                )}

                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
