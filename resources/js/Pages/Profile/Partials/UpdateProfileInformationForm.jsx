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
            name: user.name,
            email: user.email,
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
                    Mettez à jour vos informations personnelles et votre
                    adresse email.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Nom"
                        className="text-dark-700"
                    />

                    <TextInput
                        id="name"
                        className="mt-1.5 block w-full border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-1.5" message={errors.name} />
                </div>

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

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-dark-800">
                            Votre adresse email n'est pas vérifiée.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 text-sm text-primary-600 underline hover:text-primary-700"
                            >
                                Cliquez ici pour renvoyer l'email de
                                vérification.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-accent-600">
                                Un nouveau lien de vérification a été envoyé à
                                votre adresse email.
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
                            Enregistré.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
