import ConfirmModal from '@/Components/ConfirmModal';
import FormInput from '@/Components/FormInput';
import FormSelect from '@/Components/FormSelect';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    FunnelIcon,
    EyeIcon,
    ArrowUpTrayIcon,
    LockClosedIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    PhotoIcon,
    PlusIcon,
    ShieldCheckIcon,
    TrashIcon,
    UserPlusIcon,
    UsersIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import logo from '../../../../img/educampus_logo.png';

const emptyForm = {
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    sex: '',
    phone_number: '',
    profile_picture: null,
    password: '',
    password_confirmation: '',
    id_1: '',
    id_2: '',
    course_ids: [],
};

const perPageOptions = [5, 10, 15, 20, 25];

const greenButtonClass = '!rounded-xl !border !border-emerald-700 !bg-gradient-to-r !from-[#2d8b46] !to-[#24763a] !px-5 !py-3 !text-sm !font-semibold !text-white !shadow-[0_14px_26px_rgba(45,139,70,0.22)] hover:!from-[#25753b] hover:!to-[#1f6331] focus:!bg-[#25753b]';

const resolveAvatar = (path) => path || logo;

export default function Index({ users, userTypes, statuses, courses, filters }) {
    const studentType = userTypes.find((type) =>
        ['étudiant', 'etudiant'].includes(type.name?.trim().toLocaleLowerCase('fr')),
    );
    const defaultUserTypeId = (studentType ?? userTypes[0])?.id?.toString() ?? '';

    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [submittingUser, setSubmittingUser] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    const filterForm = useForm({
        search: filters.search ?? '',
        type: filters.type ?? '',
        status: filters.status ?? '',
        per_page: String(filters.per_page ?? users.per_page ?? 10),
    });

    const userForm = useForm({
        ...emptyForm,
        id_1: defaultUserTypeId,
        id_2: statuses[0]?.id?.toString() ?? '',
        course_ids: [],
    });

    const previewAvatar = useMemo(() => {
        if (userForm.data.profile_picture instanceof File) {
            return URL.createObjectURL(userForm.data.profile_picture);
        }

        return editingUser?.profile_picture || logo;
    }, [editingUser?.profile_picture, userForm.data.profile_picture]);

    const filteredCourses = useMemo(() => {
        const search = courseSearch.trim().toLocaleLowerCase('fr');

        if (!search) return courses;

        return courses.filter((course) =>
            `${course.name} ${course.description ?? ''}`.toLocaleLowerCase('fr').includes(search),
        );
    }, [courseSearch, courses]);

    const isAdministratorType = (typeId) => {
        const selectedType = userTypes.find((type) => String(type.id) === String(typeId));
        const typeName = selectedType?.name?.toLocaleLowerCase('fr') ?? '';

        return ['admin', 'administrateur'].includes(typeName);
    };

    const coursesForType = (typeId, currentCourseIds = []) =>
        isAdministratorType(typeId) ? courses.map((course) => course.id) : currentCourseIds;

    const changeUserType = (event) => {
        const typeId = event.target.value;
        userForm.setData((data) => ({
            ...data,
            id_1: typeId,
            course_ids: coursesForType(typeId, data.course_ids),
        }));
    };

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
        setCourseSearch('');
        userForm.clearErrors();
        userForm.setData({
            ...emptyForm,
            id_1: defaultUserTypeId,
            id_2: statuses[0]?.id?.toString() ?? '',
            course_ids: coursesForType(defaultUserTypeId, []),
        });
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setCourseSearch('');
        userForm.clearErrors();
        userForm.setData({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            email: user.email ?? '',
            date_of_birth: user.date_of_birth ?? '',
            sex: user.sex ?? '',
            phone_number: user.phone_number ?? '',
            profile_picture: null,
            password: '',
            password_confirmation: '',
            id_1: user.id_1?.toString() ?? '',
            id_2: user.id_2?.toString() ?? '',
            course_ids: coursesForType(
                user.id_1,
                user.courses?.map((course) => course.id) ?? [],
            ),
        });
        setModalOpen(true);
    };

    const submitUser = (e) => {
        e.preventDefault();
        userForm.clearErrors();

        const url = editingUser
            ? route('admin.users.update', editingUser.id)
            : route('admin.users.store');
        const payload = editingUser
            ? { ...userForm.data, _method: 'put' }
            : { ...userForm.data };

        router.post(url, payload, {
            preserveScroll: true,
            forceFormData: true,
            onStart: () => setSubmittingUser(true),
            onError: (errors) => userForm.setError(errors),
            onSuccess: () => {
                setModalOpen(false);
                setEditingUser(null);
                userForm.reset();
                userForm.setData('id_1', defaultUserTypeId);
                userForm.setData('id_2', statuses[0]?.id?.toString() ?? '');
                userForm.setData('course_ids', []);
            },
            onFinish: () => setSubmittingUser(false),
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
                <div>
                    <div>
                        <h1 className="text-[2rem] font-bold tracking-tight text-slate-900">Utilisateurs</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Ajoutez, filtrez, modifiez et supprimez les comptes de la plateforme.
                        </p>
                    </div>
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

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="7xl">
                <div className="max-h-[94vh] overflow-y-auto bg-[#fbfcfc]">
                    <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                {editingUser ? <PencilSquareIcon className="h-6 w-6" /> : <UserPlusIcon className="h-6 w-6" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {editingUser ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {editingUser
                                        ? 'Mettez à jour les informations et les accès de ce compte.'
                                        : 'Renseignez les informations nécessaires pour créer un nouveau compte.'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={submitUser} className="space-y-5 p-5 sm:p-6">
                        <div className="grid gap-5 xl:grid-cols-2">
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <UserPlusIcon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Informations personnelles</h3>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormInput label="Prénom *" name="first_name" value={userForm.data.first_name} onChange={(e) => userForm.setData('first_name', e.target.value)} error={userForm.errors.first_name} required />
                                        <FormInput label="Nom" name="last_name" value={userForm.data.last_name} onChange={(e) => userForm.setData('last_name', e.target.value)} error={userForm.errors.last_name} />
                                        <FormInput label="Adresse e-mail" name="email" type="email" value={userForm.data.email} onChange={(e) => userForm.setData('email', e.target.value)} error={userForm.errors.email} />
                                        <FormInput label="Téléphone" name="phone_number" value={userForm.data.phone_number} onChange={(e) => userForm.setData('phone_number', e.target.value)} error={userForm.errors.phone_number} />
                                        <FormInput label="Date de naissance" name="date_of_birth" type="date" value={userForm.data.date_of_birth} onChange={(e) => userForm.setData('date_of_birth', e.target.value)} error={userForm.errors.date_of_birth} />
                                        <FormSelect label="Sexe" name="sex" value={userForm.data.sex} onChange={(e) => userForm.setData('sex', e.target.value)} error={userForm.errors.sex}>
                                            <option value="">Non renseigné</option>
                                            <option value="homme">Homme</option>
                                            <option value="femme">Femme</option>
                                            <option value="autre">Autre</option>
                                        </FormSelect>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Photo de profil</p>
                                        <div className="mt-2 flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
                                            <img src={previewAvatar} alt="Aperçu du profil" className="h-24 w-20 rounded-xl border border-slate-200 bg-white object-cover shadow-sm" />
                                            <div className="min-w-0 flex-1">
                                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
                                                    <ArrowUpTrayIcon className="h-4 w-4" />
                                                    Choisir un fichier
                                                    <input
                                                        id="profile_picture"
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                                        className="hidden"
                                                        onChange={(e) => userForm.setData('profile_picture', e.target.files?.[0] ?? null)}
                                                    />
                                                </label>
                                                <p className="mt-2 text-xs text-slate-500">PNG, JPG ou WEBP. Maximum 2 Mo.</p>
                                                {userForm.data.profile_picture && (
                                                    <p className="mt-1 truncate text-xs font-semibold text-emerald-700">{userForm.data.profile_picture.name}</p>
                                                )}
                                            </div>
                                            {userForm.data.profile_picture && (
                                                <button type="button" onClick={() => userForm.setData('profile_picture', null)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Retirer la photo">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                        {userForm.errors.profile_picture && <p className="mt-2 text-sm text-red-600">{userForm.errors.profile_picture}</p>}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <ShieldCheckIcon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Rôle et accès</h3>
                                </div>

                                <div className="space-y-5">
                                    <FormSelect label="Type d'utilisateur *" name="id_1" value={userForm.data.id_1} onChange={changeUserType} error={userForm.errors.id_1} required>
                                        {userTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                                    </FormSelect>
                                    <FormSelect label="Statut *" name="id_2" value={userForm.data.id_2} onChange={(e) => userForm.setData('id_2', e.target.value)} error={userForm.errors.id_2} required>
                                        {statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
                                    </FormSelect>

                                    <fieldset>
                                        <legend className="text-sm font-medium text-slate-700">Cours</legend>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {isAdministratorType(userForm.data.id_1)
                                                ? 'Tous les cours sont automatiquement attribués aux administrateurs.'
                                                : 'Sélectionnez les cours suivis par cet utilisateur.'}
                                        </p>
                                        <div className="relative mt-3">
                                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="search"
                                                value={courseSearch}
                                                onChange={(event) => setCourseSearch(event.target.value)}
                                                placeholder="Rechercher un cours..."
                                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                            />
                                        </div>
                                        <div className="mt-3 max-h-[265px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                                            {filteredCourses.length === 0 ? (
                                                <p className="py-8 text-center text-sm text-slate-500">Aucun cours trouvé.</p>
                                            ) : filteredCourses.map((course) => {
                                                const checked = userForm.data.course_ids.includes(course.id);
                                                return (
                                                    <label key={course.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${checked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200'}`}>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-sm font-semibold text-slate-800">{course.name}</span>
                                                            {course.description && <span className="mt-0.5 block text-xs text-slate-500">{course.description}</span>}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            disabled={isAdministratorType(userForm.data.id_1)}
                                                            onChange={(event) => userForm.setData(
                                                                'course_ids',
                                                                event.target.checked
                                                                    ? [...userForm.data.course_ids, course.id]
                                                                    : userForm.data.course_ids.filter((id) => id !== course.id),
                                                            )}
                                                            className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {userForm.errors.course_ids && <p className="mt-2 text-sm text-red-600">{userForm.errors.course_ids}</p>}
                                    </fieldset>
                                </div>
                            </section>
                        </div>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <LockClosedIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Sécurité du compte</h3>
                                    {editingUser && <p className="text-xs text-slate-500">Laissez ces champs vides pour conserver le mot de passe actuel.</p>}
                                </div>
                            </div>
                            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
                                <FormInput label={editingUser ? 'Nouveau mot de passe' : 'Mot de passe *'} name="password" type="password" value={userForm.data.password} onChange={(e) => userForm.setData('password', e.target.value)} error={userForm.errors.password} required={!editingUser} />
                                <FormInput label={editingUser ? 'Confirmer le nouveau mot de passe' : 'Confirmation *'} name="password_confirmation" type="password" value={userForm.data.password_confirmation} onChange={(e) => userForm.setData('password_confirmation', e.target.value)} error={userForm.errors.password_confirmation} required={!editingUser} />
                            </div>
                        </section>

                        {Object.keys(userForm.errors).length > 0 && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                                <p className="font-semibold">Veuillez corriger les informations signalées avant de continuer.</p>
                            </div>
                        )}

                        <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
                            <SecondaryButton type="button" onClick={() => setModalOpen(false)} className="!rounded-xl !px-6 !py-3">Annuler</SecondaryButton>
                            <PrimaryButton type="submit" className={`${greenButtonClass} gap-2`} disabled={submittingUser}>
                                {editingUser ? <PencilSquareIcon className="h-4 w-4" /> : <UserPlusIcon className="h-4 w-4" />}
                                {submittingUser ? 'Enregistrement...' : editingUser ? 'Mettre à jour' : 'Créer le compte'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="space-y-5">
                <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    <div className="border-b border-slate-100 bg-white px-8 py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <FunnelIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-[1.65rem] font-semibold tracking-tight text-emerald-700">Filtres</h2>
                                    <p className="mt-1 text-sm text-slate-500">Recherchez par nom ou e-mail, puis filtrez par type et statut.</p>
                                </div>
                            </div>
                            <PrimaryButton className={`${greenButtonClass} gap-2 whitespace-nowrap uppercase tracking-[0.12em]`} onClick={openCreateModal}>
                                <PlusIcon className="h-5 w-5" />
                                Nouvel utilisateur
                            </PrimaryButton>
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
                                                    <Link
                                                        href={route('admin.users.show', user.id)}
                                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-700"
                                                        title="Voir les détails"
                                                        aria-label={`Voir les détails de ${user.name}`}
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Link>
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
