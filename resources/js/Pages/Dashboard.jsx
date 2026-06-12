import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import {
    CubeIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

const statConfig = [
    { key: 'totalProducts', name: 'Total Produits', icon: CubeIcon, color: 'bg-primary-500' },
    { key: 'totalClients', name: 'Total Clients', icon: UserGroupIcon, color: 'bg-accent-500' },
    { key: 'totalRevenue', name: 'Revenus', icon: CurrencyDollarIcon, color: 'bg-yellow-500' },
    { key: 'totalSales', name: 'Ventes', icon: ChartBarIcon, color: 'bg-purple-500' },
];



export default function Dashboard({ stats, recentActivities }) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-dark-500">
                        Bienvenue sur votre tableau de bord
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statConfig.map((stat) => (
                    <div key={stat.key} className="card">
                        <div className="card-body flex items-center gap-4">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                            >
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-dark-500">
                                    {stat.name}
                                </p>
                                <p className="text-2xl font-bold text-dark-900">
                                    {stats[stat.key]}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-dark-900">
                            Actions rapides
                        </h2>
                    </div>
                    <div className="card-body space-y-3">
                        <a
                            href={route('admin.products.create')}
                            className="flex items-center gap-3 rounded-lg border border-dark-200 p-3 transition-colors hover:bg-dark-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                                <CubeIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-dark-900">
                                    Ajouter un produit
                                </p>
                                <p className="text-sm text-dark-500">
                                    Créer un nouveau produit
                                </p>
                            </div>
                        </a>
                        <a
                            href={route('admin.clients.create')}
                            className="flex items-center gap-3 rounded-lg border border-dark-200 p-3 transition-colors hover:bg-dark-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100">
                                <UserGroupIcon className="h-5 w-5 text-accent-600" />
                            </div>
                            <div>
                                <p className="font-medium text-dark-900">
                                    Ajouter un client
                                </p>
                                <p className="text-sm text-dark-500">
                                    Enregistrer un nouveau client
                                </p>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-dark-900">
                            Activité récente
                        </h2>
                    </div>
                    <div className="card-body">
                        {recentActivities && recentActivities.length > 0 ? (
                            <ul className="space-y-3">
                                {recentActivities.map((activity, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 border-b border-dark-100 pb-3 last:border-0"
                                    >
                                        <div
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                activity.type === 'product'
                                                    ? 'bg-primary-100'
                                                    : 'bg-accent-100'
                                            }`}
                                        >
                                            {activity.type === 'product' ? (
                                                <CubeIcon className="h-4 w-4 text-primary-600" />
                                            ) : (
                                                <UserGroupIcon className="h-4 w-4 text-accent-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-dark-900">
                                                {activity.message}
                                            </p>
                                            <p className="text-xs text-dark-400">
                                                {new Date(activity.date).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-dark-500">
                                Aucune activité récente à afficher.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
