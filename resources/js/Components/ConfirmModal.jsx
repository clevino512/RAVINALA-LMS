import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title = 'Confirmer la suppression',
    message = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette action est irréversible.',
    confirmText = 'Supprimer',
    processing = false,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-dark-900">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-dark-600">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Annuler
                    </SecondaryButton>
                    <DangerButton onClick={onConfirm} disabled={processing}>
                        {processing
                            ? 'Traitement...'
                            : confirmText}
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
