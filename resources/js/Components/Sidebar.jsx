import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    CubeIcon,
    UserGroupIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: route('dashboard'), icon: HomeIcon },
    {
        name: 'Produits',
        href: route('admin.products.index'),
        icon: CubeIcon,
    },
    {
        name: 'Clients',
        href: route('admin.clients.index'),
        icon: UserGroupIcon,
    },

    {
        name: 'Profile',
        href: route('profile.edit'),
        icon: UserCircleIcon,
    },

];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { props } = usePage();
    const user = props.auth?.user;

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-dark-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-dark-900 transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-dark-700 px-6">
                    <Link
                        href={route('dashboard')}
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                            <CubeIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">
                            TestTechnics
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1 text-dark-400 hover:bg-dark-800 hover:text-white lg:hidden"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-dark-500">
                        Menu
                    </p>
                    {navigation.map((item) => {
                        const isActive = route().current(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`sidebar-link ${
                                    isActive ? 'active' : ''
                                }`}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-dark-700 p-3">
                    <Link
                        href={route('profile.edit')}
                        className="sidebar-link"
                    >
                        <UserCircleIcon className="h-5 w-5 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                                {user?.name}
                            </p>
                            <p className="truncate text-xs text-dark-400">
                                {user?.email}
                            </p>
                        </div>
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="sidebar-link w-full text-left"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
                        Déconnexion
                    </Link>
                </div>
            </aside>
        </>
    );
}
