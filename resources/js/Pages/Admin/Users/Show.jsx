import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    CalendarDaysIcon,
    CheckBadgeIcon,
    ClockIcon,
    EnvelopeIcon,
    IdentificationIcon,
    ShieldCheckIcon,
    PhoneIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import logo from '../../../../img/educampus_logo.png';

const formatDate = (value, withTime = false) => {
    if (!value) return 'Non renseigné';

    return new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
};

const details = (user) => [
    { label: 'Prénom', value: user.first_name || 'Non renseigné', icon: UserCircleIcon },
    { label: 'Nom', value: user.last_name || 'Non renseigné', icon: UserCircleIcon },
    { label: 'Adresse e-mail', value: user.email || 'Non renseigné', icon: EnvelopeIcon },
    { label: 'Téléphone', value: user.phone_number || 'Non renseigné', icon: PhoneIcon },
    { label: 'Date de naissance', value: formatDate(user.date_of_birth), icon: CalendarDaysIcon },
    { label: 'Sexe', value: user.sex ? user.sex.charAt(0).toUpperCase() + user.sex.slice(1) : 'Non renseigné', icon: UserCircleIcon },
    { label: 'Type de compte', value: user.user_type?.name || 'Non renseigné', icon: IdentificationIcon },
    { label: 'Statut', value: user.status?.name || 'Non renseigné', icon: CheckBadgeIcon },
    { label: 'E-mail vérifié le', value: formatDate(user.email_verified_at, true), icon: CheckBadgeIcon },
    { label: 'Dernière connexion', value: formatDate(user.last_login_at, true), icon: ClockIcon },
    { label: 'Compte créé le', value: formatDate(user.created_at, true), icon: CalendarDaysIcon },
    { label: 'Dernière modification', value: formatDate(user.updated_at, true), icon: ClockIcon },
];

export default function Show({ user }) {
    return (
        <AppLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.users.index')}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        title="Retour à la liste"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Détails de l’utilisateur</h1>
                        <p className="mt-1 text-sm text-slate-500">Toutes les informations du compte sélectionné.</p>
                    </div>
                </div>
            }
        >
            <Head title={`Détails - ${user.name}`} />

            <div className="mx-auto max-w-5xl">
                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                    <div className="bg-[linear-gradient(135deg,#07142b_0%,#10291a_100%)] px-6 py-8 sm:px-10">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <img
                                src={user.profile_picture || logo}
                                alt={user.name}
                                className="h-24 w-24 rounded-full border-4 border-white/20 bg-white object-cover shadow-xl"
                            />
                            <div className="min-w-0 text-white">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                                        {user.user_type?.name || 'Type non renseigné'}
                                    </span>
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                                        {user.status?.name || 'Statut non renseigné'}
                                    </span>
                                </div>
                                <h2 className="truncate text-3xl font-bold">{user.name}</h2>
                                <p className="mt-2 text-sm text-slate-300">{user.email}</p>
                                <p className="mt-1 text-xs text-slate-400">Identifiant utilisateur #{user.id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
                        {details(user).map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex gap-4 bg-white px-6 py-5 sm:px-8">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 px-6 py-7 sm:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <ShieldCheckIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Cours suivis</h3>
                                <p className="text-sm text-slate-500">Cours directement associés à cet utilisateur.</p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {user.courses?.length > 0 ? (
                                user.courses.map((course) => (
                                    <span
                                        key={course.id}
                                        title={course.description || course.name}
                                        className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                                    >
                                        {course.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-slate-500">Aucun cours attribué.</span>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
