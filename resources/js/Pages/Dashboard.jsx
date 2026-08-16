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
    { key: 'totalUsers', name: 'Utilisateurs', icon: UsersIcon, color: 'bg-emerald-600', tone: 'border-emerald-100 bg-emerald-50/60' },
    { key: 'totalCourses', name: 'Cours disponibles', icon: AcademicCapIcon, color: 'bg-blue-600', tone: 'border-blue-100 bg-blue-50/60' },
    { key: 'activeUsers', name: 'Comptes actifs', icon: CheckCircleIcon, color: 'bg-teal-600', tone: 'border-teal-100 bg-teal-50/60' },
    { key: 'newUsers', name: 'Nouveaux (30 jours)', icon: UserPlusIcon, color: 'bg-amber-500', tone: 'border-amber-100 bg-amber-50/60' },
    { key: 'totalProfessors', name: 'Professeurs', icon: UsersIcon, color: 'bg-indigo-600', tone: 'border-indigo-100 bg-indigo-50/60' },
    { key: 'totalStudents', name: 'Etudiants', icon: UsersIcon, color: 'bg-fuchsia-600', tone: 'border-fuchsia-100 bg-fuchsia-50/60' },
];

const highlightConfig = [
    { key: 'emptyCoursesCount', label: 'Cours sans inscription', helper: 'Aucun utilisateur attribue a ces cours.' },
    { key: 'unassignedProfessorsCount', label: 'Professeurs sans cours', helper: 'Des comptes existent sans attribution pedagogique.' },
    { key: 'unassignedStudentsCount', label: 'Etudiants sans cours', helper: 'Ideal pour verifier les affectations en attente.' },
];

function maxValue(items = []) {
    return items.reduce((max, item) => Math.max(max, Number(item?.value ?? 0)), 0);
}

function VerticalBarChart({ title, description, items, colorClass = 'bg-emerald-500' }) {
    const highest = Math.max(maxValue(items), 1);

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length} elements</span>
            </div>

            <div className="mt-8 flex h-64 items-end gap-3">
                {items.map((item) => {
                    const value = Number(item.value ?? 0);
                    const height = `${Math.max((value / highest) * 100, value > 0 ? 12 : 4)}%`;

                    return (
                        <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                            <span className="text-sm font-semibold text-slate-700">{value}</span>
                            <div className="flex h-full w-full items-end rounded-2xl bg-slate-100 p-2">
                                <div className={`w-full rounded-xl ${colorClass} transition-all`} style={{ height }} />
                            </div>
                            <span className="line-clamp-2 text-center text-xs font-medium text-slate-500">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function HorizontalBarChart({ title, description, items, colorClass = 'bg-blue-500' }) {
    const highest = Math.max(maxValue(items), 1);

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>

            <div className="mt-6 space-y-4">
                {items.map((item) => {
                    const value = Number(item.value ?? 0);
                    const width = `${Math.max((value / highest) * 100, value > 0 ? 10 : 3)}%`;

                    return (
                        <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-slate-700">{item.label}</span>
                                <span className="font-bold text-slate-900">{value}</span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${colorClass} transition-all`} style={{ width }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function Dashboard({ stats, charts, highlights, recentUsers }) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">Vue d'ensemble des utilisateurs, de l'activite et des cours.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {statConfig.map((stat) => (
                        <div key={stat.key} className={`rounded-3xl border p-5 shadow-sm ${stat.tone}`}>
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">{stats[stat.key]}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">Sante de la plateforme</p>
                        <div className="mt-4 flex flex-wrap items-end gap-6">
                            <div>
                                <p className="text-5xl font-bold">{stats.activationRate}%</p>
                                <p className="mt-2 text-sm text-slate-300">Taux de comptes actifs</p>
                            </div>
                            <div className="max-w-sm text-sm leading-6 text-slate-300">
                                Cette vue aide a suivre l'adoption de la plateforme, les affectations manquantes et les cours a surveiller.
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        {highlightConfig.map((item) => (
                            <div key={item.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                                <p className="mt-3 text-3xl font-bold text-slate-900">{highlights[item.key]}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">{item.helper}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-5 xl:grid-cols-2">
                    <VerticalBarChart
                        title="Inscriptions sur 6 mois"
                        description="Volume de comptes crees mois par mois."
                        items={charts.registrationsByMonth}
                        colorClass="bg-emerald-500"
                    />
                    <HorizontalBarChart
                        title="Repartition par role"
                        description="Vue immediate des profils presents sur la plateforme."
                        items={charts.usersByRole}
                        colorClass="bg-indigo-500"
                    />
                    <HorizontalBarChart
                        title="Repartition par statut"
                        description="Permet d'identifier l'etat reel des comptes."
                        items={charts.usersByStatus}
                        colorClass="bg-teal-500"
                    />
                    <HorizontalBarChart
                        title="Top cours les plus attribues"
                        description="Les 5 cours avec le plus d'utilisateurs associes."
                        items={charts.topCourses}
                        colorClass="bg-amber-500"
                    />
                </section>

                <div className="grid gap-5 lg:grid-cols-[0.8fr,1.2fr]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <UsersIcon className="h-6 w-6" />
                        </div>
                        <h2 className="mt-5 text-xl font-bold text-slate-900">Gestion des utilisateurs</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Ajoutez des comptes, attribuez leurs cours et controlez leur statut depuis un espace unique.
                        </p>
                        <Link href={route('admin.users.index')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                            Gerer les utilisateurs
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Utilisateurs recents</h2>
                                <p className="mt-1 text-sm text-slate-500">Les derniers comptes ajoutes a la plateforme.</p>
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
                                        <p className="truncate text-sm text-slate-500">{user.email || 'E-mail non renseigne'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-600">{user.user_type?.name || '-'}</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
                                        </p>
                                    </div>
                                </Link>
                            )) : (
                                <p className="px-6 py-12 text-center text-sm text-slate-500">Aucun utilisateur recent.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}