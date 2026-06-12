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
    const products = props.products;
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const handleDelete = (product) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            router.delete(route('admin.products.destroy', productToDelete.id), {
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">
                            Produits
                        </h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Gérez votre catalogue de produits
                        </p>
                    </div>
                    <Link
                        href={route('admin.products.create')}
                        className="btn-primary"
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        Nouveau produit
                    </Link>
                </div>
            }
        >
            <Head title="Produits" />

            <ConfirmModal
                show={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer le produit"
                message={`Êtes-vous sûr de vouloir supprimer "${productToDelete?.name}" ? Cette action est irréversible.`}
            />

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Nom</th>
                                <th>Prix</th>
                                <th>Stock</th>
                                <th>Date de création</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length === 0 ? (
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
                                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                />
                                            </svg>
                                            <p className="mt-2 font-medium">
                                                Aucun produit trouvé
                                            </p>
                                            <p className="mt-1 text-sm">
                                                Commencez par ajouter un
                                                nouveau produit
                                            </p>
                                            <Link
                                                href={route(
                                                    'admin.products.create',
                                                )}
                                                className="btn-primary mt-4"
                                            >
                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                Ajouter un produit
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-dark-50"
                                    >
                                        <td>
                                            {product.photo_url ? (
                                                <img
                                                    src={product.photo_url}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-lg border border-dark-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dark-200 bg-dark-100">
                                                    <svg
                                                        className="h-6 w-6 text-dark-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="font-medium text-dark-900">
                                                {product.name}
                                            </div>
                                            {product.description && (
                                                <div className="max-w-xs truncate text-xs text-dark-500">
                                                    {product.description}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="font-semibold text-dark-900">
                                                {Number(
                                                    product.price,
                                                ).toFixed(2)}{' '}
                                                €
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    product.stock_quantity > 10
                                                        ? 'badge-success'
                                                        : product.stock_quantity >
                                                            0
                                                          ? 'badge-warning'
                                                          : 'badge-danger'
                                                }`}
                                            >
                                                {product.stock_quantity > 10
                                                    ? 'En stock'
                                                    : product.stock_quantity >
                                                        0
                                                      ? `${product.stock_quantity} restants`
                                                      : 'Rupture'}
                                            </span>
                                        </td>
                                        <td className="text-dark-500">
                                            {product.created_at
                                                ? new Date(
                                                      product.created_at,
                                                  ).toLocaleDateString('fr-FR')
                                                : '-'}
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={route(
                                                        'admin.products.show',
                                                        product.id,
                                                    )}
                                                    className="btn-icon"
                                                    title="Voir"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route(
                                                        'admin.products.edit',
                                                        product.id,
                                                    )}
                                                    className="btn-icon text-primary-600 hover:bg-primary-50 hover:text-primary-700"
                                                    title="Modifier"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(product)
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
                {products.data.length > 0 && (
                    <Pagination links={products.links} />
                )}
            </div>
        </AppLayout>
    );
}
