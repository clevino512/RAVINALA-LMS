import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRightOnRectangleIcon,
    CubeIcon,
    HomeIcon,
    UserCircleIcon,
    UserGroupIcon,
    UsersIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import logo from '../../img/educampus_logo.png';

const navigation = [
    { name: 'Dashboard', href: route('dashboard'), icon: HomeIcon, current: 'dashboard' },
    { name: 'Produits', href: route('admin.products.index'), icon: CubeIcon, current: 'admin.products.*' },
    { name: 'Clients', href: route('admin.clients.index'), icon: UserGroupIcon, current: 'admin.clients.*' },
    { name: 'Utilisateurs', href: route('admin.users.index'), icon: UsersIcon, current: 'admin.users.*' },
    { name: 'Profil', href: route('profile.edit'), icon: UserCircleIcon, current: 'profile.*' },
];

const resolveAvatar = (path) => path || logo;

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { props } = usePage();
    const user = props.auth?.user;

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col border-r border-emerald-950/10 bg-[linear-gradient(180deg,#07142b_0%,#081126_42%,#10291a_100%)] text-white transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-24 shrink-0 items-center justify-between border-b border-white/8 px-5">
                    <Link href={route('dashboard')} className="flex items-center gap-3">
                        <img src={logo} alt="EduCampus" className="h-12 w-auto object-contain" />
                        <div>
                            <p className="text-[15px] font-bold leading-tight text-white">EduCampus</p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/80">
                                Administration
                            </p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-7">
                    <p className="mb-5 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Navigation
                    </p>

                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = route().current(item.current);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-[#1ca46c] to-[#2d8b46] text-white shadow-[0_16px_28px_rgba(34,197,94,0.20)]'
                                            : 'text-slate-200 hover:bg-white/6 hover:text-white'
                                    }`}
                                >
                                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-emerald-300'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 pt-0">
                    <div className="rounded-[22px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="flex items-center gap-3">
                            <img
                                src={resolveAvatar(user?.profile_picture)}
                                alt={user?.name}
                                className="h-12 w-12 rounded-full border border-emerald-300/20 bg-white object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                                <p className="truncate text-xs text-slate-300">{user?.email}</p>
                            </div>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/18 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/20"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
                            Deconnexion
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
