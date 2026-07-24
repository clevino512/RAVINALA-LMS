import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import {
    EnvelopeIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import logo from '../../../img/educampus_logo.png';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const authError = errors.email || errors.password;

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7faf8] px-4 py-8">
            <Head title="Connexion" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(247,250,248,0.92)_42%,_rgba(241,247,244,1)_100%)]" />
            <div className="absolute -left-24 bottom-[-8rem] h-64 w-64 rounded-full bg-emerald-100/70 blur-2xl" />
            <div className="absolute -right-20 top-[-5rem] h-56 w-56 rounded-full bg-cyan-100/60 blur-2xl" />

            <div className="relative z-10 w-full max-w-[480px] rounded-[24px] border border-slate-200/80 bg-white px-6 py-7 shadow-[0_18px_44px_rgba(15,23,42,0.08)] sm:px-7 sm:py-8">
                <div className="mx-auto w-full max-w-[390px]">
                    <div className="text-center">
                        <img
                            src={logo}
                            alt="EduCampus"
                            className="mx-auto h-20 w-auto object-contain"
                        />
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                            Connexion a EduCampus
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Accedez a votre espace administrateur, professeur ou etudiant.
                        </p>
                    </div>

                    <div className="mt-6">
                        {status && (
                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                {status}
                            </div>
                        )}

                        {authError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {authError}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="email"
                                    value="Adresse e-mail"
                                    className="text-sm font-semibold text-slate-900"
                                />
                                <div className="relative mt-2">
                                    <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full rounded-xl border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        autoComplete="username"
                                        placeholder="Entrez votre adresse e-mail"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email && !authError ? errors.email : ''} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Mot de passe"
                                    className="text-sm font-semibold text-slate-900"
                                />
                                <div className="relative mt-2">
                                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="block w-full rounded-xl border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        autoComplete="current-password"
                                        placeholder="Entrez votre mot de passe"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <label className="flex items-center gap-3 text-sm text-slate-600">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span>Se souvenir de moi</span>
                            </label>

                            <PrimaryButton
                                className="w-full justify-center rounded-xl border border-emerald-700 bg-gradient-to-r from-[#2d8b46] to-[#24763a] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(45,139,70,0.22)] transition hover:from-[#25753b] hover:to-[#1f6331] focus:bg-[#25753b]"
                                disabled={processing}
                            >
                                <span className="inline-flex items-center gap-2.5">
                                    <LockClosedIcon className="h-4 w-4" />
                                    {processing ? 'Connexion...' : 'Se connecter'}
                                </span>
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
