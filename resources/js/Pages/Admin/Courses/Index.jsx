import ConfirmModal from '@/Components/ConfirmModal';
import FormInput from '@/Components/FormInput';
import FormSelect from '@/Components/FormSelect';
import FormTextarea from '@/Components/FormTextarea';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    BookOpenIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    PlusIcon,
    Squares2X2Icon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';

const emptyCourseForm = {
    name: '',
    description: '',
};

const emptyModuleForm = {
    title: '',
    description: '',
    position: '',
};

const emptyLessonForm = {
    title: '',
    description: '',
    lesson_file: null,
    existing_file_path: '',
    duration: '',
    position: '',
    is_published: false,
    lesson_type_id: '',
};

const greenButtonClass = '!rounded-xl !border !border-emerald-700 !bg-gradient-to-r !from-[#2d8b46] !to-[#24763a] !px-5 !py-3 !text-sm !font-semibold !text-white !shadow-[0_14px_26px_rgba(45,139,70,0.22)] hover:!from-[#25753b] hover:!to-[#1f6331]';

export default function Index({ courses, lessonTypes }) {
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? null);
    const [selectedModuleId, setSelectedModuleId] = useState(courses[0]?.modules?.[0]?.id ?? null);
    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [lessonModalOpen, setLessonModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [courseForm, setCourseForm] = useState(emptyCourseForm);
    const [moduleForm, setModuleForm] = useState(emptyModuleForm);
    const [lessonForm, setLessonForm] = useState(emptyLessonForm);
    const [courseErrors, setCourseErrors] = useState({});
    const [moduleErrors, setModuleErrors] = useState({});
    const [lessonErrors, setLessonErrors] = useState({});
    const [courseAction, setCourseAction] = useState({ mode: 'create', item: null });
    const [moduleAction, setModuleAction] = useState({ mode: 'create', item: null });
    const [lessonAction, setLessonAction] = useState({ mode: 'create', item: null });
    const [confirmState, setConfirmState] = useState({ title: '', message: '', onConfirm: null });
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const selectedCourse = useMemo(
        () => courses.find((course) => course.id === selectedCourseId) ?? null,
        [courses, selectedCourseId],
    );

    const selectedModule = useMemo(
        () => selectedCourse?.modules?.find((module) => module.id === selectedModuleId) ?? null,
        [selectedCourse, selectedModuleId],
    );

    const stats = useMemo(() => ({
        totalCourses: courses.length,
        totalModules: courses.reduce((sum, course) => sum + course.modules_count, 0),
        totalLessons: courses.reduce((sum, course) => sum + course.lessons_count, 0),
    }), [courses]);

    useEffect(() => {
        if (!courses.length) {
            setSelectedCourseId(null);
            setSelectedModuleId(null);
            return;
        }

        const hasCurrentCourse = courses.some((course) => course.id === selectedCourseId);
        const nextCourseId = hasCurrentCourse ? selectedCourseId : courses[0].id;
        setSelectedCourseId(nextCourseId);

        const nextCourse = courses.find((course) => course.id === nextCourseId) ?? courses[0];
        const hasCurrentModule = nextCourse.modules?.some((module) => module.id === selectedModuleId);
        setSelectedModuleId(hasCurrentModule ? selectedModuleId : (nextCourse.modules?.[0]?.id ?? null));
    }, [courses, selectedCourseId, selectedModuleId]);

    const reloadData = (callback) => {
        router.reload({
            only: ['courses', 'lessonTypes'],
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => callback?.(),
        });
    };

    const normalizeErrors = (error) => error?.response?.status === 422 ? error.response.data.errors ?? {} : {};
    const resolveErrorMessage = (error, fallback) => error?.response?.data?.message ?? fallback;

    useEffect(() => {
        if (!feedback) return undefined;

        const timeout = window.setTimeout(() => setFeedback(null), 5000);

        return () => window.clearTimeout(timeout);
    }, [feedback]);

    const closeCourseModal = () => {
        setCourseModalOpen(false);
        setCourseAction({ mode: 'create', item: null });
        setCourseForm(emptyCourseForm);
        setCourseErrors({});
    };

    const closeModuleModal = () => {
        setModuleModalOpen(false);
        setModuleAction({ mode: 'create', item: null });
        setModuleForm(emptyModuleForm);
        setModuleErrors({});
    };

    const closeLessonModal = () => {
        setLessonModalOpen(false);
        setLessonAction({ mode: 'create', item: null });
        setLessonForm(emptyLessonForm);
        setLessonErrors({});
    };

    const openCreateCourseModal = () => {
        setCourseAction({ mode: 'create', item: null });
        setCourseForm(emptyCourseForm);
        setCourseErrors({});
        setCourseModalOpen(true);
    };

    const openEditCourseModal = (course) => {
        setCourseAction({ mode: 'edit', item: course });
        setCourseForm({
            name: course.name ?? '',
            description: course.description ?? '',
        });
        setCourseErrors({});
        setCourseModalOpen(true);
    };

    const openCreateModuleModal = () => {
        if (!selectedCourse) return;
        setModuleAction({ mode: 'create', item: null });
        setModuleForm({
            ...emptyModuleForm,
            position: String((selectedCourse.modules?.length ?? 0) + 1),
        });
        setModuleErrors({});
        setModuleModalOpen(true);
    };

    const openEditModuleModal = (module) => {
        setModuleAction({ mode: 'edit', item: module });
        setModuleForm({
            title: module.title ?? '',
            description: module.description ?? '',
            position: String(module.position ?? ''),
        });
        setModuleErrors({});
        setModuleModalOpen(true);
    };

    const openCreateLessonModal = () => {
        if (!selectedModule) return;
        setLessonAction({ mode: 'create', item: null });
        setLessonForm({
            ...emptyLessonForm,
            position: String((selectedModule.lessons?.length ?? 0) + 1),
            lesson_type_id: lessonTypes[0]?.id ? String(lessonTypes[0].id) : '',
        });
        setLessonErrors({});
        setLessonModalOpen(true);
    };

    const openEditLessonModal = (lesson) => {
        setLessonAction({ mode: 'edit', item: lesson });
        setLessonForm({
            title: lesson.title ?? '',
            description: lesson.description ?? '',
            lesson_file: null,
            existing_file_path: lesson.file_path ?? '',
            duration: lesson.duration ?? '',
            position: String(lesson.position ?? ''),
            is_published: Boolean(lesson.is_published),
            lesson_type_id: lesson.lesson_type_id ? String(lesson.lesson_type_id) : '',
        });
        setLessonErrors({});
        setLessonModalOpen(true);
    };

    const submitCourse = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setCourseErrors({});
        setFeedback(null);

        try {
            const response = courseAction.mode === 'edit' && courseAction.item
                ? await axios.put(route('admin.lms.courses.update', courseAction.item.id), courseForm)
                : await axios.post(route('admin.lms.courses.store'), courseForm);

            reloadData(() => {
                closeCourseModal();
                setFeedback({ type: 'success', message: response?.data?.message ?? 'Le cours a ete enregistre avec succes.' });
            });
        } catch (error) {
            setCourseErrors(normalizeErrors(error));
            setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d enregistrer le cours.') });
        } finally {
            setProcessing(false);
        }
    };

    const submitModule = async (event) => {
        event.preventDefault();
        if (!selectedCourse) return;
        setProcessing(true);
        setModuleErrors({});
        setFeedback(null);

        try {
            const payload = {
                ...moduleForm,
                position: Number(moduleForm.position),
            };

            const response = moduleAction.mode === 'edit' && moduleAction.item
                ? await axios.put(
                    route('admin.lms.courses.modules.update', [selectedCourse.id, moduleAction.item.id]),
                    payload,
                )
                : await axios.post(route('admin.lms.courses.modules.store', selectedCourse.id), payload);

            reloadData(() => {
                closeModuleModal();
                setFeedback({ type: 'success', message: response?.data?.message ?? 'Le module a ete enregistre avec succes.' });
            });
        } catch (error) {
            setModuleErrors(normalizeErrors(error));
            setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d enregistrer le module.') });
        } finally {
            setProcessing(false);
        }
    };

    const submitLesson = async (event) => {
        event.preventDefault();
        if (!selectedCourse || !selectedModule) return;
        setProcessing(true);
        setLessonErrors({});
        setFeedback(null);

        try {
            const payload = new FormData();
            payload.append('title', lessonForm.title);
            payload.append('description', lessonForm.description || '');
            payload.append('duration', lessonForm.duration === '' ? '' : String(Number(lessonForm.duration)));
            payload.append('position', String(Number(lessonForm.position)));
            payload.append('lesson_type_id', String(Number(lessonForm.lesson_type_id)));
            payload.append('is_published', lessonForm.is_published ? '1' : '0');
            payload.append('existing_file_path', lessonForm.existing_file_path || '');

            if (lessonForm.lesson_file instanceof File) {
                payload.append('lesson_file', lessonForm.lesson_file);
            }

            const response = lessonAction.mode === 'edit' && lessonAction.item
                ? await axios.post(
                    route('admin.lms.courses.modules.lessons.update', [selectedCourse.id, selectedModule.id, lessonAction.item.id]),
                    (() => {
                        payload.append('_method', 'put');
                        return payload;
                    })(),
                    { headers: { 'Content-Type': 'multipart/form-data' } },
                )
                : await axios.post(
                    route('admin.lms.courses.modules.lessons.store', [selectedCourse.id, selectedModule.id]),
                    payload,
                    { headers: { 'Content-Type': 'multipart/form-data' } },
                );

            reloadData(() => {
                closeLessonModal();
                setFeedback({ type: 'success', message: response?.data?.message ?? 'La lecon a ete enregistree avec succes.' });
            });
        } catch (error) {
            setLessonErrors(normalizeErrors(error));
            setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d enregistrer la lecon.') });
        } finally {
            setProcessing(false);
        }
    };

    const askDeleteCourse = (course) => {
        setConfirmState({
            title: 'Supprimer le cours',
            message: `Voulez-vous vraiment supprimer "${course.name}" ? Les modules et les lecons associees seront egalement supprimees.`,
            onConfirm: async () => {
                setProcessing(true);
                try {
                    const response = await axios.delete(route('admin.lms.courses.destroy', course.id));
                    reloadData(() => {
                        setConfirmModalOpen(false);
                        setSelectedCourseId(null);
                        setSelectedModuleId(null);
                        setFeedback({ type: 'success', message: response?.data?.message ?? 'Le cours a ete supprime avec succes.' });
                    });
                } catch (error) {
                    setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d effectuer cette suppression.') });
                } finally {
                    setProcessing(false);
                }
            },
        });
        setConfirmModalOpen(true);
    };

    const askDeleteModule = (module) => {
        if (!selectedCourse) return;
        setConfirmState({
            title: 'Supprimer le module',
            message: `Voulez-vous vraiment supprimer "${module.title}" ? Les lecons de ce module seront egalement supprimees.`,
            onConfirm: async () => {
                setProcessing(true);
                try {
                    const response = await axios.delete(route('admin.lms.courses.modules.destroy', [selectedCourse.id, module.id]));
                    reloadData(() => {
                        setConfirmModalOpen(false);
                        setSelectedModuleId(null);
                        setFeedback({ type: 'success', message: response?.data?.message ?? 'Le module a ete supprime avec succes.' });
                    });
                } catch (error) {
                    setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d effectuer cette suppression.') });
                } finally {
                    setProcessing(false);
                }
            },
        });
        setConfirmModalOpen(true);
    };

    const askDeleteLesson = (lesson) => {
        if (!selectedCourse || !selectedModule) return;
        setConfirmState({
            title: 'Supprimer la lecon',
            message: `Voulez-vous vraiment supprimer "${lesson.title}" ?`,
            onConfirm: async () => {
                setProcessing(true);
                try {
                    const response = await axios.delete(
                        route('admin.lms.courses.modules.lessons.destroy', [selectedCourse.id, selectedModule.id, lesson.id]),
                    );
                    reloadData(() => {
                        setConfirmModalOpen(false);
                        setFeedback({ type: 'success', message: response?.data?.message ?? 'La lecon a ete supprimee avec succes.' });
                    });
                } catch (error) {
                    setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d effectuer cette suppression.') });
                } finally {
                    setProcessing(false);
                }
            },
        });
        setConfirmModalOpen(true);
    };

    return (

        <AppLayout
            header={(
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">Gestion des cours</h1>
                        <p className="mt-1 text-sm text-dark-500">
                            Administrez les cours, leurs modules et leurs leçons depuis une seule interface.
                        </p>
                    </div>
                    <PrimaryButton className={greenButtonClass} onClick={openCreateCourseModal}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Nouveau cours
                    </PrimaryButton>
                </div>
            )}
        >
            <Head title="Gestion des cours" />

            {feedback && (
                <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}

            <ConfirmModal
                show={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                processing={processing}
            />

            <Modal show={courseModalOpen} onClose={closeCourseModal} maxWidth="2xl">
                <form onSubmit={submitCourse} className="space-y-5 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-dark-900">
                            {courseAction.mode === 'edit' ? 'Modifier le cours' : 'Ajouter un cours'}
                        </h2>
                        <p className="mt-1 text-sm text-dark-500">
                            Définissez le libellé principal et la description du cours.
                        </p>
                    </div>

                    <FormInput
                        label="Nom du cours"
                        name="name"
                        value={courseForm.name}
                        onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))}
                        error={courseErrors.name}
                        required
                    />

                    <FormTextarea
                        label="Description"
                        name="description"
                        value={courseForm.description}
                        onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
                        error={courseErrors.description}
                        rows={5}
                    />

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeCourseModal} disabled={processing}>Annuler</SecondaryButton>
                        <PrimaryButton type="submit" className={greenButtonClass} disabled={processing}>
                            {processing ? 'Enregistrement...' : courseAction.mode === 'edit' ? 'Mettre à jour' : 'Créer le cours'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={moduleModalOpen} onClose={closeModuleModal} maxWidth="2xl">
                <form onSubmit={submitModule} className="space-y-5 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-dark-900">
                            {moduleAction.mode === 'edit' ? 'Modifier le module' : 'Ajouter un module'}
                        </h2>
                        <p className="mt-1 text-sm text-dark-500">
                            {selectedCourse ? `Cours concerné: ${selectedCourse.name}` : 'Sélectionnez d’abord un cours.'}
                        </p>
                    </div>

                    <FormInput
                        label="Titre du module"
                        name="title"
                        value={moduleForm.title}
                        onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))}
                        error={moduleErrors.title}
                        required
                    />

                    <FormTextarea
                        label="Description"
                        name="description"
                        value={moduleForm.description}
                        onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))}
                        error={moduleErrors.description}
                        rows={4}
                    />

                    <FormInput
                        label="Position"
                        name="position"
                        type="number"
                        value={moduleForm.position}
                        onChange={(event) => setModuleForm((current) => ({ ...current, position: event.target.value }))}
                        error={moduleErrors.position}
                        required
                    />

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeModuleModal} disabled={processing}>Annuler</SecondaryButton>
                        <PrimaryButton type="submit" className={greenButtonClass} disabled={processing}>
                            {processing ? 'Enregistrement...' : moduleAction.mode === 'edit' ? 'Mettre à jour' : 'Créer le module'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={lessonModalOpen} onClose={closeLessonModal} maxWidth="2xl">
                <form onSubmit={submitLesson} className="space-y-5 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-dark-900">
                            {lessonAction.mode === 'edit' ? 'Modifier la leçon' : 'Ajouter une leçon'}
                        </h2>
                        <p className="mt-1 text-sm text-dark-500">
                            {selectedModule ? `Module concerné: ${selectedModule.title}` : 'Sélectionnez d’abord un module.'}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Titre de la leçon"
                            name="title"
                            value={lessonForm.title}
                            onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))}
                            error={lessonErrors.title}
                            required
                        />
                        <FormSelect
                            label="Type de leçon"
                            name="lesson_type_id"
                            value={lessonForm.lesson_type_id}
                            onChange={(event) => setLessonForm((current) => ({ ...current, lesson_type_id: event.target.value }))}
                            error={lessonErrors.lesson_type_id}
                            required
                        >
                            <option value="">Sélectionner</option>
                            {lessonTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </FormSelect>
                        <FormInput
                            label="Position"
                            name="position"
                            type="number"
                            value={lessonForm.position}
                            onChange={(event) => setLessonForm((current) => ({ ...current, position: event.target.value }))}
                            error={lessonErrors.position}
                            required
                        />
                        <FormInput
                            label="Durée (minutes)"
                            name="duration"
                            type="number"
                            value={lessonForm.duration}
                            onChange={(event) => setLessonForm((current) => ({ ...current, duration: event.target.value }))}
                            error={lessonErrors.duration}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-dark-700">Fichier de la lecon</label>
                        <input
                            type="file"
                            onChange={(event) => setLessonForm((current) => ({ ...current, lesson_file: event.target.files?.[0] ?? null }))}
                            className="block w-full rounded-xl border border-dark-300 bg-white px-4 py-3 text-sm text-dark-800 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {lessonForm.lesson_file && (
                            <p className="mt-2 text-xs text-emerald-700">Fichier selectionne: {lessonForm.lesson_file.name}</p>
                        )}
                        {!lessonForm.lesson_file && lessonForm.existing_file_path && (
                            <p className="mt-2 break-all text-xs text-dark-500">Chemin actuel: {lessonForm.existing_file_path}</p>
                        )}
                        {lessonErrors.lesson_file && <p className="mt-2 text-sm text-red-600">{lessonErrors.lesson_file}</p>}
                    </div>

                    <FormTextarea
                        label="Description"
                        name="description"
                        value={lessonForm.description}
                        onChange={(event) => setLessonForm((current) => ({ ...current, description: event.target.value }))}
                        error={lessonErrors.description}
                        rows={4}
                    />

                    <label className="flex items-center gap-3 rounded-xl border border-dark-200 bg-dark-50 px-4 py-3 text-sm text-dark-700">
                        <input
                            type="checkbox"
                            checked={lessonForm.is_published}
                            onChange={(event) => setLessonForm((current) => ({ ...current, is_published: event.target.checked }))}
                            className="rounded border-dark-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Publier immédiatement cette leçon
                    </label>
                    {lessonErrors.is_published && <p className="text-sm text-red-600">{lessonErrors.is_published}</p>}

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeLessonModal} disabled={processing}>Annuler</SecondaryButton>
                        <PrimaryButton type="submit" className={greenButtonClass} disabled={processing || !lessonTypes.length}>
                            {processing ? 'Enregistrement...' : lessonAction.mode === 'edit' ? 'Mettre à jour' : 'Créer la leçon'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <BookOpenIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-dark-500">Cours</p>
                                <p className="text-3xl font-bold text-dark-900">{stats.totalCourses}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                                <Squares2X2Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-dark-500">Modules</p>
                                <p className="text-3xl font-bold text-dark-900">{stats.totalModules}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                                <ClipboardDocumentListIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-dark-500">Leçons</p>
                                <p className="text-3xl font-bold text-dark-900">{stats.totalLessons}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
                    <div className="rounded-3xl border border-dark-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-dark-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold text-dark-900">Cours disponibles</h2>
                                <p className="mt-1 text-sm text-dark-500">Choisissez un cours pour gérer sa structure.</p>
                            </div>
                        </div>

                        <div className="max-h-[720px] overflow-y-auto p-4">
                            {courses.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-dark-200 px-5 py-10 text-center text-sm text-dark-500">
                                    Aucun cours disponible pour le moment.
                                </div>
                            ) : courses.map((course) => {
                                const active = course.id === selectedCourseId;

                                return (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCourseId(course.id);
                                            setSelectedModuleId(course.modules?.[0]?.id ?? null);
                                        }}
                                        className={`mb-3 w-full rounded-2xl border p-4 text-left transition ${
                                            active
                                                ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                                                : 'border-dark-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold text-dark-900">{course.name}</h3>
                                                <p className="mt-1 line-clamp-2 text-sm text-dark-500">
                                                    {course.description || 'Aucune description'}
                                                </p>
                                            </div>
                                            <ChevronRightIcon className={`h-5 w-5 shrink-0 ${active ? 'text-emerald-700' : 'text-dark-300'}`} />
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-dark-100 px-3 py-1 text-dark-600">{course.modules_count} modules</span>
                                            <span className="rounded-full bg-dark-100 px-3 py-1 text-dark-600">{course.lessons_count} leçons</span>
                                            <span className="rounded-full bg-dark-100 px-3 py-1 text-dark-600">{course.users_count} apprenants</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {selectedCourse ? (
                            <>
                                <section className="rounded-3xl border border-dark-100 bg-white p-6 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                                    <BookOpenIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-dark-900">{selectedCourse.name}</h2>
                                                    <p className="mt-1 text-sm text-dark-500">
                                                        {selectedCourse.description || 'Aucune description pour ce cours.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <SecondaryButton className="!rounded-xl" onClick={() => openEditCourseModal(selectedCourse)}>
                                                <PencilSquareIcon className="mr-2 h-4 w-4" />
                                                Modifier
                                            </SecondaryButton>
                                            <SecondaryButton className="!rounded-xl" onClick={openCreateModuleModal}>
                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                Ajouter un module
                                            </SecondaryButton>
                                            <button
                                                type="button"
                                                onClick={() => askDeleteCourse(selectedCourse)}
                                                className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                                            >
                                                <TrashIcon className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-dark-100 bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-dark-100 px-6 py-5">
                                        <div>
                                            <h2 className="text-lg font-semibold text-dark-900">Modules du cours</h2>
                                            <p className="mt-1 text-sm text-dark-500">Sélectionnez un module pour afficher ses leçons.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 p-4 lg:grid-cols-2">
                                        {selectedCourse.modules.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-dark-200 px-5 py-10 text-center text-sm text-dark-500 lg:col-span-2">
                                                Aucun module n’a encore été créé pour ce cours.
                                            </div>
                                        ) : selectedCourse.modules.map((module) => {
                                            const active = module.id === selectedModuleId;

                                            return (
                                                <div
                                                    key={module.id}
                                                    className={`rounded-2xl border p-5 transition ${
                                                        active
                                                            ? 'border-blue-300 bg-blue-50'
                                                            : 'border-dark-100 bg-white hover:border-blue-200'
                                                    }`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedModuleId(module.id)}
                                                        className="w-full text-left"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                                                                    Module {module.position}
                                                                </p>
                                                                <h3 className="mt-1 text-lg font-semibold text-dark-900">{module.title}</h3>
                                                                <p className="mt-2 line-clamp-3 text-sm text-dark-500">
                                                                    {module.description || 'Aucune description'}
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-dark-600 shadow-sm">
                                                                {module.lessons.length} leçons
                                                            </span>
                                                        </div>
                                                    </button>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <SecondaryButton className="!rounded-xl" onClick={() => openEditModuleModal(module)}>
                                                            <PencilSquareIcon className="mr-2 h-4 w-4" />
                                                            Modifier
                                                        </SecondaryButton>
                                                        <SecondaryButton className="!rounded-xl" onClick={() => {
                                                            setSelectedModuleId(module.id);
                                                            openCreateLessonModal();
                                                        }}>
                                                            <PlusIcon className="mr-2 h-4 w-4" />
                                                            Ajouter une leçon
                                                        </SecondaryButton>
                                                        <button
                                                            type="button"
                                                            onClick={() => askDeleteModule(module)}
                                                            className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                                                        >
                                                            <TrashIcon className="mr-2 h-4 w-4" />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-dark-100 bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-dark-100 px-6 py-5">
                                        <div>
                                            <h2 className="text-lg font-semibold text-dark-900">
                                                {selectedModule ? `Leçons du module "${selectedModule.title}"` : 'Leçons'}
                                            </h2>
                                            <p className="mt-1 text-sm text-dark-500">
                                                {selectedModule ? 'Gérez le contenu détaillé du module sélectionné.' : 'Sélectionnez un module pour afficher ses leçons.'}
                                            </p>
                                        </div>
                                        {selectedModule && (
                                            <PrimaryButton className={greenButtonClass} onClick={openCreateLessonModal} disabled={!lessonTypes.length}>
                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                Nouvelle leçon
                                            </PrimaryButton>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        {!selectedModule ? (
                                            <div className="rounded-2xl border border-dashed border-dark-200 px-5 py-10 text-center text-sm text-dark-500">
                                                Sélectionnez un module pour consulter ou gérer ses leçons.
                                            </div>
                                        ) : selectedModule.lessons.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-dark-200 px-5 py-10 text-center text-sm text-dark-500">
                                                Aucune leçon n’a encore été ajoutée à ce module.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedModule.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="rounded-2xl border border-dark-100 bg-white p-5">
                                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                                        Leçon {lesson.position}
                                                                    </span>
                                                                    <span className="rounded-full bg-dark-100 px-3 py-1 text-xs font-semibold text-dark-600">
                                                                        {lesson.lesson_type?.name || 'Type non défini'}
                                                                    </span>
                                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                        lesson.is_published
                                                                            ? 'bg-emerald-100 text-emerald-700'
                                                                            : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        {lesson.is_published ? 'Publiée' : 'Brouillon'}
                                                                    </span>
                                                                </div>
                                                                <h3 className="mt-3 text-lg font-semibold text-dark-900">{lesson.title}</h3>
                                                                <p className="mt-2 text-sm text-dark-500">
                                                                    {lesson.description || 'Aucune description'}
                                                                </p>
                                                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-dark-500">
                                                                    <span>Durée: {lesson.duration || 'Non définie'}</span>
                                                                    <span>Fichier: {lesson.file_path || 'Aucun chemin renseigné'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                <SecondaryButton className="!rounded-xl" onClick={() => openEditLessonModal(lesson)}>
                                                                    <PencilSquareIcon className="mr-2 h-4 w-4" />
                                                                    Modifier
                                                                </SecondaryButton>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => askDeleteLesson(lesson)}
                                                                    className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                                                                >
                                                                    <TrashIcon className="mr-2 h-4 w-4" />
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-dark-200 bg-white px-6 py-16 text-center text-dark-500 shadow-sm">
                                Créez un premier cours pour commencer la structuration du contenu pédagogique.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}





