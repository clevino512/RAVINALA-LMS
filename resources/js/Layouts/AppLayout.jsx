import { useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { usePage } from '@inertiajs/react';

export default function AppLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { props } = usePage();
    const flash = props.flash;

    return (
        <div className="min-h-screen bg-dark-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-dark-200 bg-white/80 px-4 shadow-sm backdrop-blur-sm sm:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 hover:text-dark-700 lg:hidden"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    {header && (
                        <div className="flex-1">{header}</div>
                    )}
                </header>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mx-4 mt-4 rounded-lg border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-800 sm:mx-6">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:mx-6">
                        {flash.error}
                    </div>
                )}

                {/* Page content */}
                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
