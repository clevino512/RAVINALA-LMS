import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-dark-900">
                    Supprimer le compte
                </h2>

                <p className="mt-1 text-sm text-dark-600">
                    Une fois votre compte supprimé, toutes ses ressources et
                    données seront supprimées définitivement. Avant de supprimer
                    votre compte, veuillez télécharger toutes les données que
                    vous souhaitez conserver.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Supprimer le compte
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-semibold text-dark-900">
                        Êtes-vous sûr de vouloir supprimer votre compte ?
                    </h2>

                    <p className="mt-1 text-sm text-dark-600">
                        Une fois votre compte supprimé, toutes ses ressources et
                        données seront supprimées définitivement. Veuillez
                        entrer votre mot de passe pour confirmer la suppression
                        définitive de votre compte.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Mot de passe"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1.5 block w-3/4 border-dark-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                            isFocused
                            placeholder="Mot de passe"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Annuler
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            Supprimer le compte
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
