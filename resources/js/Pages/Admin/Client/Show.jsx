import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
/**
 * @param {{ client: import('@/Types/client').Client }} props
 */
export default function Show({ client }) {
    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.clients.index')}
                            className="btn-icon"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-dark-900">
                                {client.first_name} {client.last_name}
                            </h1>
                            <p className="mt-1 text-sm text-dark-500">
                                Détails du client
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('admin.clients.edit', client.id)}
                        className="btn-primary"
                    >
                        <PencilSquareIcon className="mr-2 h-5 w-5" />
                        Modifier
                    </Link>
                </div>
            }
        >
            <Head title={`${client.first_name} ${client.last_name}`} />

            <div className="mx-auto max-w-3xl">
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center gap-4 border-b border-dark-200 pb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                                {client.first_name.charAt(0).toUpperCase()}
                                {client.last_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-dark-900">
                                    {client.first_name} {client.last_name}
                                </h2>
                                <p className="text-sm text-dark-500">
                                    Client depuis{' '}
                                    {client.created_at
                                        ? new Date(
                                              client.created_at,
                                          ).toLocaleDateString('fr-FR', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                                    <EnvelopeIcon className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-dark-500">
                                        Email
                                    </p>
                                    <a
                                        href={`mailto:${client.email}`}
                                        className="text-dark-900 hover:text-primary-600"
                                    >
                                        {client.email}
                                    </a>
                                </div>
                            </div>

                            {client.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50">
                                        <PhoneIcon className="h-5 w-5 text-accent-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-dark-500">
                                            Téléphone
                                        </p>
                                        <a
                                            href={`tel:${client.phone}`}
                                            className="text-dark-900 hover:text-primary-600"
                                        >
                                            {client.phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {client.address && (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
                                        <MapPinIcon className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-dark-500">
                                            Adresse
                                        </p>
                                        <p className="text-dark-900">
                                            {client.address}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
