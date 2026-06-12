import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import ConfirmModal from '@/Components/ConfirmModal';
import Pagination from '@/Components/Pagination';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
export default function Index() {
    const { props } = usePage();
    const clients = props.clients;
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    const handleDelete = (client) => {
        setClientToDelete(client);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (clientToDelete) {
            router.delete(
                route('admin.clients.destroy', clientToDelete.id),
                {
                    onSuccess: () => {
                        setDeleteModalOpen(false);
                        setClientToDelete(null);
                    },
                },
            );
        }
    };

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">
                            Clients
                        </h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Gérez votre base de clients
                        </p>
                    </div>
                    <Link
                        href={route('admin.clients.create')}
                        className="btn-primary"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        Nouveau client
                    </Link>
                </div>
            }
        >
            <Head title="Clients" />

            <ConfirmModal
                show={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setClientToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer le client"
                message={`Êtes-vous sûr de vouloir supprimer "${clientToDelete?.first_name} ${clientToDelete?.last_name}" ? Cette action est irréversible.`}
            />

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nom complet</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Adresse</th>
                                <th>Date de création</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-dark-500"
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg
                                                className="h-12 w-12 text-dark-300"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <p className="mt-2 font-medium">
                                                Aucun client trouvé
                                            </p>
                                            <p className="mt-1 text-sm">
                                                Commencez par ajouter un
                                                nouveau client
                                            </p>
                                            <Link
                                                href={route(
                                                    'admin.clients.create',
                                                )}
                                                className="btn-primary mt-4"
                                            >
                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                Ajouter un client
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                clients.data.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-dark-50"
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                                                    {client.first_name.charAt(
                                                        0,
                                                    ).toUpperCase()}
                                                    {client.last_name.charAt(
                                                        0,
                                                    ).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-dark-900">
                                                    {client.first_name}{' '}
                                                    {client.last_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <a
                                                href={`mailto:${client.email}`}
                                                className="text-primary-600 hover:text-primary-700 hover:underline"
                                            >
                                                {client.email}
                                            </a>
                                        </td>
                                        <td className="text-dark-600">
                                            {client.phone || '-'}
                                        </td>
                                        <td className="max-w-xs truncate text-dark-600">
                                            {client.address || '-'}
                                        </td>
                                        <td className="text-dark-500">
                                            {client.created_at
                                                ? new Date(
                                                      client.created_at,
                                                  ).toLocaleDateString('fr-FR')
                                                : '-'}
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={route(
                                                        'admin.clients.show',
                                                        client.id,
                                                    )}
                                                    className="btn-icon"
                                                    title="Voir"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route(
                                                        'admin.clients.edit',
                                                        client.id,
                                                    )}
                                                    className="btn-icon text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                                                    title="Modifier"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(client)
                                                    }
                                                    className="btn-icon text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {clients.data.length > 0 && (
                    <Pagination links={clients.links} />
                )}
            </div>
        </AppLayout>
    );
}
