import { useEffect, useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import { Bars3Icon, CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePage } from '@inertiajs/react';

export default function AppLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { props } = usePage();
    const flash = props.flash;
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const nextNotification = flash?.success
            ? { type: 'success', message: flash.success }
            : flash?.error
                ? { type: 'error', message: flash.error }
                : null;

        setNotification(nextNotification);

        if (!nextNotification) return undefined;

        const timeout = window.setTimeout(() => setNotification(null), 5000);

        return () => window.clearTimeout(timeout);
    }, [flash?.success, flash?.error]);

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

                {notification && (
                    <div
                        role="status"
                        aria-live="polite"
                        className={`fixed right-4 top-24 z-40 flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg sm:right-6 ${
                            notification.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        {notification.type === 'success'
                            ? <CheckCircleIcon className="h-5 w-5 shrink-0" />
                            : <ExclamationCircleIcon className="h-5 w-5 shrink-0" />}
                        <span className="leading-5">{notification.message}</span>
                        <button
                            type="button"
                            onClick={() => setNotification(null)}
                            className="ml-2 shrink-0 rounded-lg p-0.5 opacity-60 transition hover:bg-black/5 hover:opacity-100"
                            aria-label="Fermer la notification"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
