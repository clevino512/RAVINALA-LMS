import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            email: user.email ?? '',
            phone_number: user.phone_number ?? '',
            date_of_birth: user.date_of_birth ?? '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-semibold text-dark-900">
                    Informations du profil
                </h2>

                <p className="mt-1 text-sm text-dark-600">
                    Mettez a jour vos informations personnelles et votre
                    adresse email.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel
                            htmlFor="first_name"
                            value="Prenom"
                            className="text-dark-700"
                        />

                        <TextInput
                            id="first_name"
                            className="mt-1.5 block w-full border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                            isFocused
                            autoComplete="given-name"
                        />

                        <InputError className="mt-1.5" message={errors.first_name} />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="last_name"
                            value="Nom"
                            className="text-dark-700"
                        />

                        <TextInput
                            id="last_name"
                            className="mt-1.5 block w-full border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            autoComplete="family-name"
                        />

                        <InputError className="mt-1.5" message={errors.last_name} />
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Email"
                            className="text-dark-700"
                        />

                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1.5 block w-full border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-1.5" message={errors.email} />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="phone_number"
                            value="Telephone"
                            className="text-dark-700"
                        />

                        <TextInput
                            id="phone_number"
                            className="mt-1.5 block w-full border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            autoComplete="tel"
                        />

                        <InputError className="mt-1.5" message={errors.phone_number} />
                    </div>
                </div>

                <div>
                    <InputLabel
                        htmlFor="date_of_birth"
                        value="Date de naissance"
                        className="text-dark-700"
                    />

                    <TextInput
                        id="date_of_birth"
                        type="date"
                        className="mt-1.5 block w-full border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                        value={data.date_of_birth}
                        onChange={(e) => setData('date_of_birth', e.target.value)}
                    />

                    <InputError className="mt-1.5" message={errors.date_of_birth} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-dark-800">
                            Votre adresse email n'est pas verifiee.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 text-sm text-primary-600 underline hover:text-primary-700"
                            >
                                Cliquez ici pour renvoyer l'email de verification.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-accent-600">
                                Un nouveau lien de verification a ete envoye a votre adresse email.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        Enregistrer
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-dark-600">
                            Enregistre.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
