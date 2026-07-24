import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, reset } = useForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email ?? '',
        phone_number: user.phone_number ?? '',
        date_of_birth: user.date_of_birth ?? '',
        sex: user.sex ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
        });
    };

    const fieldClass = 'mt-1.5 block w-full border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500';

    return (
        <form onSubmit={submit} className="space-y-8">
            <section>
                <header className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <UserCircleIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-dark-900">Informations du profil</h2>
                        <p className="mt-1 text-sm text-dark-600">
                            Mettez à jour vos informations personnelles et votre adresse e-mail.
                        </p>
                    </div>
                </header>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="first_name" value="Prénom" className="text-dark-700" />
                        <TextInput id="first_name" className={fieldClass} value={data.first_name} onChange={(event) => setData('first_name', event.target.value)} required autoComplete="given-name" />
                        <InputError className="mt-1.5" message={errors.first_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="last_name" value="Nom" className="text-dark-700" />
                        <TextInput id="last_name" className={fieldClass} value={data.last_name} onChange={(event) => setData('last_name', event.target.value)} autoComplete="family-name" />
                        <InputError className="mt-1.5" message={errors.last_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="email" value="E-mail" className="text-dark-700" />
                        <TextInput id="email" type="email" className={fieldClass} value={data.email} onChange={(event) => setData('email', event.target.value)} required autoComplete="username" />
                        <InputError className="mt-1.5" message={errors.email} />
                    </div>
                    <div>
                        <InputLabel htmlFor="phone_number" value="Téléphone" className="text-dark-700" />
                        <TextInput id="phone_number" className={fieldClass} value={data.phone_number} onChange={(event) => setData('phone_number', event.target.value)} autoComplete="tel" />
                        <InputError className="mt-1.5" message={errors.phone_number} />
                    </div>
                    <div>
                        <InputLabel htmlFor="date_of_birth" value="Date de naissance" className="text-dark-700" />
                        <TextInput id="date_of_birth" type="date" className={fieldClass} value={data.date_of_birth} onChange={(event) => setData('date_of_birth', event.target.value)} />
                        <InputError className="mt-1.5" message={errors.date_of_birth} />
                    </div>
                    <div>
                        <InputLabel htmlFor="sex" value="Sexe" className="text-dark-700" />
                        <select
                            id="sex"
                            value={data.sex}
                            onChange={(event) => setData('sex', event.target.value)}
                            className="input-select mt-1.5"
                        >
                            <option value="">Non renseigné</option>
                            <option value="homme">Homme</option>
                            <option value="femme">Femme</option>
                            <option value="autre">Autre</option>
                        </select>
                        <InputError className="mt-1.5" message={errors.sex} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="mt-5">
                        <p className="text-sm text-dark-800">
                            Votre adresse e-mail n’est pas vérifiée.
                            <Link href={route('verification.send')} method="post" as="button" className="ml-1 text-sm text-primary-600 underline hover:text-primary-700">
                                Renvoyer l’e-mail de vérification
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-sm font-medium text-emerald-600">Un nouveau lien de vérification a été envoyé.</p>
                        )}
                    </div>
                )}
            </section>

            <section className="border-t border-slate-200 pt-7">
                <header className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <LockClosedIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-dark-900">Modifier le mot de passe</h2>
                        <p className="mt-1 text-sm text-dark-600">
                            Laissez ces champs vides pour conserver votre mot de passe actuel.
                        </p>
                    </div>
                </header>

                {user.must_change_password && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                        Première connexion : vous devez définir un nouveau mot de passe avant de continuer.
                    </div>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="current_password" value="Mot de passe actuel" className="text-dark-700" />
                        <TextInput id="current_password" type="password" className={fieldClass} value={data.current_password} onChange={(event) => setData('current_password', event.target.value)} required={user.must_change_password} autoComplete="current-password" />
                        <InputError className="mt-1.5" message={errors.current_password} />
                    </div>
                    <div>
                        <InputLabel htmlFor="password" value="Nouveau mot de passe" className="text-dark-700" />
                        <TextInput id="password" type="password" className={fieldClass} value={data.password} onChange={(event) => setData('password', event.target.value)} required={user.must_change_password} autoComplete="new-password" />
                        <InputError className="mt-1.5" message={errors.password} />
                    </div>
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" className="text-dark-700" />
                        <TextInput id="password_confirmation" type="password" className={fieldClass} value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} required={user.must_change_password} autoComplete="new-password" />
                        <InputError className="mt-1.5" message={errors.password_confirmation} />
                    </div>
                </div>
            </section>

            <div className="flex justify-end border-t border-slate-200 pt-6">
                <PrimaryButton disabled={processing} className="!rounded-xl !bg-emerald-600 !px-6 !py-3 hover:!bg-emerald-700">
                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                </PrimaryButton>
            </div>
        </form>
    );
}
