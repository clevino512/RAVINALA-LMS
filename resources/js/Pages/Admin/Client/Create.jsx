import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import FormInput from '@/Components/FormInput';
import FormTextarea from '@/Components/FormTextarea';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.clients.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.clients.index')}
                        className="btn-icon"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">
                            Nouveau client
                        </h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Ajoutez un nouveau client à votre base
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Nouveau client" />

            <form onSubmit={submit} className="mx-auto max-w-3xl">
                <div className="card">
                    <div className="card-body space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormInput
                                label="Prénom"
                                name="first_name"
                                value={data.first_name}
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                                error={errors.first_name}
                                required
                                placeholder="Ex: Jean"
                            />

                            <FormInput
                                label="Nom"
                                name="last_name"
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                                error={errors.last_name}
                                required
                                placeholder="Ex: Dupont"
                            />
                        </div>

                        <FormInput
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                            placeholder="Ex: jean.dupont@email.com"
                        />

                        <FormInput
                            label="Téléphone"
                            name="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            error={errors.phone}
                            placeholder="Ex: +33 6 12 34 56 78"
                        />

                        <FormTextarea
                            label="Adresse"
                            name="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            error={errors.address}
                            placeholder="Ex: 123 Rue de Paris, 75001 Paris"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-dark-200 px-6 py-4">
                        <Link
                            href={route('admin.clients.index')}
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
                                : 'Créer le client'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
