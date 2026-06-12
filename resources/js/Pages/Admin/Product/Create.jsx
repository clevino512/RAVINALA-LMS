import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import FormInput from '@/Components/FormInput';
import FormTextarea from '@/Components/FormTextarea';
import InputError from '@/Components/InputError';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        photo_url: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
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
                            Nouveau produit
                        </h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Ajoutez un nouveau produit à votre catalogue
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Nouveau produit" />

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
                            placeholder="Ex: Ordinateur portable"
                        />

                        <FormTextarea
                            label="Description"
                            name="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            error={errors.description}
                            placeholder="Décrivez le produit..."
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
                                placeholder="0.00"
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
                                placeholder="0"
                            />
                        </div>

                        {/* Photo upload */}
                        <div>
                            <label className="block text-sm font-medium text-dark-700">
                                Photo
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
                                ? 'Création...'
                                : 'Créer le produit'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
