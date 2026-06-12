import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
export default function Show({ product }) {
    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.products.index')}
                            className="btn-icon"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-dark-900">
                                {product.name}
                            </h1>
                            <p className="mt-1 text-sm text-dark-500">
                                Détails du produit
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('admin.products.edit', product.id)}
                        className="btn-primary"
                    >
                        <PencilSquareIcon className="mr-2 h-5 w-5" />
                        Modifier
                    </Link>
                </div>
            }
        >
            <Head title={product.name} />

            <div className="mx-auto max-w-3xl">
                <div className="card">
                    <div className="card-body">
                        <div className="flex flex-col gap-6 sm:flex-row">
                            {product.photo_url ? (
                                <img
                                    src={product.photo_url}
                                    alt={product.name}
                                    className="h-48 w-48 shrink-0 rounded-xl border border-dark-200 object-cover"
                                />
                            ) : (
                                <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-xl border border-dark-200 bg-dark-100">
                                    <svg
                                        className="h-16 w-16 text-dark-400"
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
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-dark-500">
                                        Nom
                                    </h3>
                                    <p className="mt-1 text-lg font-semibold text-dark-900">
                                        {product.name}
                                    </p>
                                </div>
                                {product.description && (
                                    <div>
                                        <h3 className="text-sm font-medium text-dark-500">
                                            Description
                                        </h3>
                                        <p className="mt-1 text-dark-700">
                                            {product.description}
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-dark-500">
                                            Prix
                                        </h3>
                                        <p className="mt-1 text-xl font-bold text-primary-600">
                                            {Number(product.price).toFixed(2)}{' '}
                                            €
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-dark-500">
                                            Stock
                                        </h3>
                                        <p className="mt-1">
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
                                        </p>
                                    </div>
                                </div>
                                {product.created_at && (
                                    <div>
                                        <h3 className="text-sm font-medium text-dark-500">
                                            Créé le
                                        </h3>
                                        <p className="mt-1 text-dark-700">
                                            {new Date(
                                                product.created_at,
                                            ).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
