import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import FormInput from '@/Components/FormInput';
import FormTextarea from '@/Components/FormTextarea';
import InputError from '@/Components/InputError';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
/**
 * @param {{ product: import('@/Types/product').Product }} props
 */
export default function Edit({ product }) {
    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price || ''),
        stock_quantity: String(product.stock_quantity || ''),
        photo_url: null,
        _method: 'put',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.update', product.id), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.products.index')}
                        className="btn-icon"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">
                            Modifier le produit
                        </h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Modifiez les informations du produit
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Modifier - ${product.name}`} />

            <form onSubmit={submit} className="mx-auto max-w-3xl">
                <div className="card">
                    <div className="card-body space-y-6">
                        <FormInput
                            label="Nom du produit"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />

                        <FormTextarea
                            label="Description"
                            name="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            error={errors.description}
                            rows={4}
                        />

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormInput
                                label="Prix (€)"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                error={errors.price}
                                required
                            />

                            <FormInput
                                label="Quantité en stock"
                                name="stock_quantity"
                                type="number"
                                min="0"
                                value={data.stock_quantity}
                                onChange={(e) =>
                                    setData('stock_quantity', e.target.value)
                                }
                                error={errors.stock_quantity}
                                required
                            />
                        </div>

                        {/* Current photo */}
                        {product.photo_url && (
                            <div>
                                <label className="block text-sm font-medium text-dark-700">
                                    Photo actuelle
                                </label>
                                <img
                                    src={product.photo_url}
                                    alt={product.name}
                                    className="mt-1.5 h-32 w-32 rounded-lg border border-dark-200 object-cover"
                                />
                            </div>
                        )}

                        {/* Photo upload */}
                        <div>
                            <label className="block text-sm font-medium text-dark-700">
                                {product.photo_url
                                    ? 'Changer la photo'
                                    : 'Ajouter une photo'}
                            </label>
                            <div className="mt-1.5">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'photo_url',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="block w-full text-sm text-dark-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
                                />
                            </div>
                            {errors.photo_url && (
                                <InputError
                                    message={errors.photo_url}
                                    className="mt-1.5"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-dark-200 px-6 py-4">
                        <Link
                            href={route('admin.products.index')}
                            className="btn-secondary"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={processing}
                        >
                            {processing
                                ? 'Modification...'
                                : 'Modifier le produit'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
