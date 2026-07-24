import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AcademicCapIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    UserPlusIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';

const statConfig = [
    { key: 'totalUsers', name: 'Utilisateurs', icon: UsersIcon, color: 'bg-emerald-600' },
    { key: 'totalCourses', name: 'Cours disponibles', icon: AcademicCapIcon, color: 'bg-blue-600' },
    { key: 'activeUsers', name: 'Comptes actifs', icon: CheckCircleIcon, color: 'bg-teal-600' },
    { key: 'newUsers', name: 'Nouveaux (30 jours)', icon: UserPlusIcon, color: 'bg-amber-500' },
];

export default function Dashboard({ stats, recentUsers }) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">Vue d’ensemble des utilisateurs et des cours.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statConfig.map((stat) => (
                    <div key={stat.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{stats[stat.key]}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr,1.2fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <UsersIcon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-xl font-bold text-slate-900">Gestion des utilisateurs</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Ajoutez des comptes, attribuez leurs cours et contrôlez leur statut depuis un espace unique.
                    </p>
                    <Link href={route('admin.users.index')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        Gérer les utilisateurs
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Utilisateurs récents</h2>
                            <p className="mt-1 text-sm text-slate-500">Les derniers comptes ajoutés à la plateforme.</p>
                        </div>
                        <ClockIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentUsers?.length > 0 ? recentUsers.map((user) => (
                            <Link key={user.id} href={route('admin.users.show', user.id)} className="flex items-center gap-4 px-6 py-4 transition hover:bg-emerald-50/40">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                                    {user.first_name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-slate-900">{user.name}</p>
                                    <p className="truncate text-sm text-slate-500">{user.email || 'E-mail non renseigné'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-slate-600">{user.user_type?.name || '-'}</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
                                    </p>
                                </div>
                            </Link>
                        )) : (
                            <p className="px-6 py-12 text-center text-sm text-slate-500">Aucun utilisateur récent.</p>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
