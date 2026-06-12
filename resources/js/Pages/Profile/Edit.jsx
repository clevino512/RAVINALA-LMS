import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">
                        Profil
                    </h1>
                    <p className="mt-1 text-sm text-dark-500">
                        Gérez votre profil et vos paramètres de compte
                    </p>
                </div>
            }
        >
            <Head title="Profil" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="card">
                    <div className="card-body">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <UpdatePasswordForm />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
