import ConfirmModal from '@/Components/ConfirmModal';
import FormInput from '@/Components/FormInput';
import FormSelect from '@/Components/FormSelect';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    FunnelIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    PhotoIcon,
    PlusIcon,
    TrashIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import logo from '../../../../img/educampus_logo.png';

const emptyForm = {
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    phone_number: '',
    profile_picture: null,
    password: '',
    password_confirmation: '',
    id_type: '',
    id_status: '',
};

const perPageOptions = [5, 10, 15, 20, 25];

const greenButtonClass = '!rounded-xl !border !border-emerald-700 !bg-gradient-to-r !from-[#2d8b46] !to-[#24763a] !px-5 !py-3 !text-sm !font-semibold !text-white !shadow-[0_14px_26px_rgba(45,139,70,0.22)] hover:!from-[#25753b] hover:!to-[#1f6331] focus:!bg-[#25753b]';

const resolveAvatar = (path) => path || logo;

export default function Index({ users, userTypes, statuses, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const filterForm = useForm({
        search: filters.search ?? '',
        type: filters.type ?? '',
        status: filters.status ?? '',
        per_page: String(filters.per_page ?? users.per_page ?? 10),
    });

    const userForm = useForm({
        ...emptyForm,
        id_type: userTypes[0]?.id?.toString() ?? '',
        id_status: statuses[0]?.id?.toString() ?? '',
    });

    const previewAvatar = useMemo(() => {
        if (userForm.data.profile_picture instanceof File) {
            return URL.createObjectURL(userForm.data.profile_picture);
        }

        return editingUser?.profile_picture || logo;
    }, [editingUser?.profile_picture, userForm.data.profile_picture]);

    const submitFilters = (data, options = {}) => {
        router.get(route('admin.users.index'), data, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            ...options,
        });
    };

    const applyFilters = (e) => {
        e.preventDefault();
        submitFilters({ ...filterForm.data, page: 1 });
    };

    const resetFilters = () => {
        const nextFilters = {
            search: '',
            type: '',
            status: '',
            per_page: String(filters.per_page ?? 10),
        };

        filterForm.setData(nextFilters);
        submitFilters({ ...nextFilters, page: 1 });
    };

    const changePerPage = (e) => {
        const perPage = e.target.value;
        filterForm.setData('per_page', perPage);
        submitFilters({ ...filterForm.data, per_page: perPage, page: 1 });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        userForm.clearErrors();
        userForm.setData({
            ...emptyForm,
            id_type: userTypes[0]?.id?.toString() ?? '',
            id_status: statuses[0]?.id?.toString() ?? '',
        });
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        userForm.clearErrors();
        userForm.setData({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            email: user.email ?? '',
            date_of_birth: user.date_of_birth ?? '',
            phone_number: user.phone_number ?? '',
            profile_picture: null,
            password: '',
            password_confirmation: '',
            id_type: user.id_type?.toString() ?? '',
            id_status: user.id_status?.toString() ?? '',
        });
        setModalOpen(true);
    };

    const submitUser = (e) => {
        e.preventDefault();

        if (editingUser) {
            userForm
                .transform((data) => ({ ...data, _method: 'put' }))
                .post(route('admin.users.update', editingUser.id), {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        setModalOpen(false);
                        setEditingUser(null);
                        userForm.reset('password', 'password_confirmation', 'profile_picture');
                        userForm.transform((data) => data);
                    },
                });
            return;
        }

        userForm.post(route('admin.users.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setModalOpen(false);
                userForm.reset();
                userForm.setData('id_type', userTypes[0]?.id?.toString() ?? '');
                userForm.setData('id_status', statuses[0]?.id?.toString() ?? '');
            },
        });
    };

    const requestDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;
        router.delete(route('admin.users.destroy', userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
            },
        });
    };

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900">Utilisateurs</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Ajoutez, filtrez, modifiez et supprimez les comptes de la plateforme.
                        </p>
                    </div>
                    <PrimaryButton className={`${greenButtonClass} gap-2 uppercase tracking-[0.12em]`} onClick={openCreateModal}>
                        <PlusIcon className="h-5 w-5" />
                        Nouvel utilisateur
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Utilisateurs" />

            <ConfirmModal
                show={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Supprimer l'utilisateur"
                message={`Voulez-vous vraiment supprimer ${userToDelete?.name ?? 'cet utilisateur'} ? Cette action est irreversible.`}
            />

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="2xl">
                <div className="p-6 sm:p-7">
                    <div>
                        <h2 className="text-xl font-semibold text-dark-900">
                            {editingUser ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
                        </h2>
                        <p className="mt-1 text-sm text-dark-500">
                            Renseignez les informations du compte, le type d'utilisateur et sa photo de profil.
                        </p>
                    </div>

                    <form onSubmit={submitUser} className="mt-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormInput label="Prenom" name="first_name" value={userForm.data.first_name} onChange={(e) => userForm.setData('first_name', e.target.value)} error={userForm.errors.first_name} required />
                            <FormInput label="Nom" name="last_name" value={userForm.data.last_name} onChange={(e) => userForm.setData('last_name', e.target.value)} error={userForm.errors.last_name} />
                        </div>

                        <FormInput label="Adresse e-mail" name="email" type="email" value={userForm.data.email} onChange={(e) => userForm.setData('email', e.target.value)} error={userForm.errors.email} required />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormInput label="Date de naissance" name="date_of_birth" type="date" value={userForm.data.date_of_birth} onChange={(e) => userForm.setData('date_of_birth', e.target.value)} error={userForm.errors.date_of_birth} />
                            <FormInput label="Telephone" name="phone_number" value={userForm.data.phone_number} onChange={(e) => userForm.setData('phone_number', e.target.value)} error={userForm.errors.phone_number} />
                        </div>

                        <div>
                            <label htmlFor="profile_picture" className="text-sm font-medium text-dark-700">
                                Photo de profil
                            </label>
                            <div className="mt-2 flex items-center gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4">
                                <img
                                    src={previewAvatar}
                                    alt="Apercu profil"
                                    className="h-16 w-16 rounded-2xl border border-emerald-100 object-cover shadow-sm"
                                />
                                <div className="flex-1">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50">
                                        <PhotoIcon className="h-4 w-4" />
                                        Choisir un fichier
                                        <input
                                            id="profile_picture"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            className="hidden"
                                            onChange={(e) => userForm.setData('profile_picture', e.target.files?.[0] ?? null)}
                                        />
                                    </label>
                                    <p className="mt-2 text-xs text-dark-500">
                                        PNG, JPG ou WEBP. Le chemin public du fichier sera enregistre en base.
                                    </p>
                                    {userForm.data.profile_picture && (
                                        <p className="mt-1 text-xs font-medium text-emerald-700">
                                            {userForm.data.profile_picture.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {userForm.errors.profile_picture && <p className="mt-2 text-sm text-red-600">{userForm.errors.profile_picture}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormSelect label="Type d'utilisateur" name="id_type" value={userForm.data.id_type} onChange={(e) => userForm.setData('id_type', e.target.value)} error={userForm.errors.id_type} required>
                                {userTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </FormSelect>
                            <FormSelect label="Statut" name="id_status" value={userForm.data.id_status} onChange={(e) => userForm.setData('id_status', e.target.value)} error={userForm.errors.id_status} required>
                                {statuses.map((status) => (
                                    <option key={status.id} value={status.id}>{status.name}</option>
                                ))}
                            </FormSelect>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormInput label={editingUser ? 'Nouveau mot de passe' : 'Mot de passe'} name="password" type="password" value={userForm.data.password} onChange={(e) => userForm.setData('password', e.target.value)} error={userForm.errors.password} required={!editingUser} />
                            <FormInput label="Confirmation" name="password_confirmation" type="password" value={userForm.data.password_confirmation} onChange={(e) => userForm.setData('password_confirmation', e.target.value)} error={userForm.errors.password_confirmation} required={!editingUser} />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Annuler</SecondaryButton>
                            <PrimaryButton type="submit" className={greenButtonClass} disabled={userForm.processing}>
                                {userForm.processing ? 'Enregistrement...' : editingUser ? 'Mettre a jour' : 'Creer le compte'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="space-y-5">
                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    <div className="border-b border-slate-100 bg-white px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <FunnelIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-[1.65rem] font-semibold tracking-tight text-emerald-700">Filtres</h2>
                                <p className="mt-1 text-sm text-slate-500">Recherchez par nom ou e-mail, puis filtrez par type et statut.</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-7">
                        <form onSubmit={applyFilters} className="grid gap-4 xl:grid-cols-[1.65fr,1fr,1fr,auto]">
                            <div className="relative self-end">
                                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={filterForm.data.search}
                                    onChange={(e) => filterForm.setData('search', e.target.value)}
                                    placeholder="Nom ou e-mail"
                                    className="input-field rounded-2xl py-3.5 pl-12"
                                />
                            </div>
                            <FormSelect label="Type" name="type" value={filterForm.data.type} onChange={(e) => filterForm.setData('type', e.target.value)}>
                                <option value="">Tous les types</option>
                                {userTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </FormSelect>
                            <FormSelect label="Statut" name="status" value={filterForm.data.status} onChange={(e) => filterForm.setData('status', e.target.value)}>
                                <option value="">Tous les statuts</option>
                                {statuses.map((status) => (
                                    <option key={status.id} value={status.id}>{status.name}</option>
                                ))}
                            </FormSelect>
                            <div className="flex items-end gap-3">
                                <PrimaryButton className={`${greenButtonClass} gap-2`}>
                                    <FunnelIcon className="h-4 w-4" />
                                    Filtrer
                                </PrimaryButton>
                                <SecondaryButton className="!rounded-xl !px-5 !py-3 !text-[0.8rem]" onClick={resetFilters}>
                                    Reinitialiser
                                </SecondaryButton>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    <div className="border-b border-slate-100 bg-white px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <UsersIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-[1.65rem] font-semibold tracking-tight text-emerald-700">Liste des utilisateurs</h2>
                                <p className="mt-1 text-sm text-slate-500">Visualisez les comptes existants et gerez leurs informations.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-white">
                                <tr className="text-left text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    <th className="px-8 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Date de creation</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                    <UsersIcon className="h-8 w-8" />
                                                </div>
                                                <p className="mt-4 text-base font-semibold text-slate-900">Aucun utilisateur trouve</p>
                                                <p className="mt-1 text-sm">Essayez de modifier vos filtres ou ajoutez un nouveau compte.</p>
                                                <PrimaryButton className={`mt-5 ${greenButtonClass} gap-2`} onClick={openCreateModal}>
                                                    <PlusIcon className="h-4 w-4" />
                                                    Ajouter un utilisateur
                                                </PrimaryButton>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-emerald-50/20">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={resolveAvatar(user.profile_picture)}
                                                        alt={user.name}
                                                        className="h-12 w-12 rounded-full border border-emerald-100 object-cover shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{user.name}</div>
                                                        <div className="mt-1 text-xs text-slate-400">ID #{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-700">{user.email}</td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                                    {user.user_type?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                        user.status?.name === 'actif'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    {user.status?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-slate-700">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(user)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-blue-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                        title="Modifier"
                                                    >
                                                        <PencilSquareIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => requestDelete(user)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-100 hover:text-rose-600"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.data.length > 0 && (
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-8 py-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                                <span>Affichage</span>
                                <select
                                    value={filterForm.data.per_page}
                                    onChange={changePerPage}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                                >
                                    {perPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <span>
                                    sur {users.total ?? users.data.length} resultats
                                </span>
                                <span className="text-slate-400">
                                    {users.from && users.to ? `(${users.from}-${users.to})` : ''}
                                </span>
                            </div>
                            <Pagination links={users.links} />
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

