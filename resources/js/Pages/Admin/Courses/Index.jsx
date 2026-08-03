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
    ArrowDownTrayIcon,
    BookOpenIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    DocumentTextIcon,
    EllipsisHorizontalIcon,
    PauseIcon,
    PencilSquareIcon,
    PlayIcon,
    PlusIcon,
    SpeakerWaveIcon,
    Squares2X2Icon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';

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
    lesson_files: [],
    deleted_file_ids: [],
    duration: '',
    position: '',
    is_published: false,
    lesson_type_id: '',
};

const greenButtonClass = '!rounded-xl !border !border-emerald-700 !bg-gradient-to-r !from-[#2d8b46] !to-[#24763a] !px-5 !py-3 !text-sm !font-semibold !text-white !shadow-[0_14px_26px_rgba(45,139,70,0.22)] hover:!from-[#25753b] hover:!to-[#1f6331]';
const maxLessonFileSize = 500 * 1024 * 1024;

const publicMediaUrl = (path) => {
    if (!path) return null;
    if (/^(https?:|blob:|data:)/i.test(path)) return path;

    const normalizedPath = String(path).replace(/^\/+/, '');

    if (normalizedPath.startsWith('lessons/data/') || normalizedPath.startsWith('storage/')) {
        return `/lesson-media?path=${encodeURIComponent(`/${normalizedPath.replace(/^storage\//, 'storage/')}`)}`;
    }

    return `/${normalizedPath.replace(/^storage\//, 'storage/')}`;
};

const mediaKind = (source, mimeType = '') => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';

    const cleanSource = String(source ?? '').split(/[?#]/)[0].toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(cleanSource)) return 'image';
    if (/\.(mp4|webm|ogg|mov|m4v|mkv|avi|wmv|3gp)$/.test(cleanSource)) return 'video';
    if (/\.(mp3|wav|oga|aac|m4a|flac)$/.test(cleanSource)) return 'audio';
    if (/\.pdf$/.test(cleanSource)) return 'pdf';

    return 'file';
};

function formatMediaTime(value) {
    if (!Number.isFinite(value) || value < 0) {
        return '0:00';
    }

    const totalSeconds = Math.floor(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function MediaPlayer({ url, kind, frameClass }) {
    const mediaRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        const media = mediaRef.current;
        if (!media) return undefined;

        const syncState = () => {
            setCurrentTime(media.currentTime || 0);
            setDuration(media.duration || 0);
            setIsPlaying(!media.paused && !media.ended);
        };

        syncState();

        media.addEventListener('loadedmetadata', syncState);
        media.addEventListener('timeupdate', syncState);
        media.addEventListener('play', syncState);
        media.addEventListener('pause', syncState);
        media.addEventListener('ended', syncState);

        return () => {
            media.removeEventListener('loadedmetadata', syncState);
            media.removeEventListener('timeupdate', syncState);
            media.removeEventListener('play', syncState);
            media.removeEventListener('pause', syncState);
            media.removeEventListener('ended', syncState);
        };
    }, [url]);

    const togglePlayback = async () => {
        const media = mediaRef.current;
        if (!media) return;

        if (media.paused) {
            await media.play();
        } else {
            media.pause();
        }
    };

    const handleSeek = (event) => {
        const media = mediaRef.current;
        if (!media) return;

        const nextTime = Number(event.target.value);
        media.currentTime = nextTime;
        setCurrentTime(nextTime);
    };

    const handleVolumeChange = (event) => {
        const media = mediaRef.current;
        const nextVolume = Number(event.target.value);
        setVolume(nextVolume);

        if (media) {
            media.volume = nextVolume;
        }
    };

    const changePlaybackRate = (event) => {
        const media = mediaRef.current;
        const nextRate = Number(event.target.value);
        setPlaybackRate(nextRate);

        if (media) {
            media.playbackRate = nextRate;
        }
    };

    return (
        <div className={`${frameClass} ${kind === 'video' ? 'bg-black' : 'p-4'}`}>
            {kind === 'video' ? (
                <video ref={mediaRef} src={url} preload="metadata" className="max-h-80 w-full" />
            ) : (
                <audio ref={mediaRef} src={url} preload="metadata" className="hidden" />
            )}
            <div className={`space-y-3 ${kind === 'video' ? 'border-t border-white/10 bg-slate-950 p-4 text-white' : ''}`}>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            void togglePlayback();
                        }}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${kind === 'video' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                        aria-label={isPlaying ? 'Mettre en pause' : 'Lire le m\u00E9dia'}
                    >
                        {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                    </button>
                    <span className={`w-24 text-sm font-medium tabular-nums ${kind === 'video' ? 'text-white' : 'text-slate-700'}`}>
                        {formatMediaTime(currentTime)} / {formatMediaTime(duration)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={Math.min(currentTime, duration || 0)}
                        onInput={handleSeek}
                        onChange={handleSeek}
                        className="h-2 min-w-[180px] flex-1 cursor-pointer accent-emerald-600"
                        aria-label="Avancer ou reculer dans le m\u00E9dia"
                    />
                    <div className="flex items-center gap-2">
                        <SpeakerWaveIcon className={`h-5 w-5 ${kind === 'video' ? 'text-white' : 'text-slate-500'}`} />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="h-2 w-20 cursor-pointer accent-emerald-600"
                            aria-label="Volume"
                        />
                    </div>
                    <select
                        value={playbackRate}
                        onChange={changePlaybackRate}
                        className={`rounded-lg border px-2 py-1 text-sm ${kind === 'video' ? 'border-white/20 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                        aria-label="Vitesse de lecture"
                    >
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => <option key={rate} value={rate}>{rate}x</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
}

function VideoPreview({ url, frameClass }) {
    return <MediaPlayer url={url} kind="video" frameClass={frameClass} />;
}

function MediaPreview({ source, mimeType = '', className = '' }) {
    const url = publicMediaUrl(source);
    if (!url) return null;

    const kind = mediaKind(source, mimeType);
    const frameClass = `overflow-hidden rounded-2xl border border-dark-200 bg-dark-50 ${className}`;

    if (kind === 'image') {
        return <div className={frameClass}><img src={url} alt="Aper\u00E7u de la leçon" className="h-64 w-full object-contain" /></div>;
    }

    if (kind === 'video') {
        return <VideoPreview url={url} frameClass={frameClass} />;
    }

    if (kind === 'audio') {
        return <MediaPlayer url={url} kind="audio" frameClass={frameClass} />;
    }

    if (kind === 'pdf') {
        const fileName = decodeURIComponent(String(source).split('/').pop()?.split(/[?#]/)[0] || 'Document PDF');

        return (
            <div className={`${frameClass} flex min-h-40 items-center gap-5 p-6`}>
                <div className="flex h-28 w-20 shrink-0 flex-col items-center justify-end rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <DocumentTextIcon className="mb-2 h-9 w-9 text-slate-400" />
                    <span className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">PDF</span>
                </div>
                <div className="min-w-0">
                    <p className="truncate font-semibold text-dark-800">{fileName}</p>
                    <a
                        href={url}
                        download={fileName}
                        className="mt-4 inline-flex items-center rounded-xl border border-dark-200 bg-white px-4 py-2 text-sm font-semibold text-dark-700 shadow-sm hover:bg-dark-50"
                    >
                        <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                        Télécharger le PDF
                    </a>
                </div>
            </div>
        );
    }

    return (
        <a href={url} target="_blank" rel="noreferrer" className={`${frameClass} block px-4 py-5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50`}>
            Ouvrir le contenu de la leçon
        </a>
    );
}
function LessonFilesCarousel({ files }) {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex((current) => Math.min(current, Math.max(files.length - 1, 0)));
    }, [files.length]);

    const scrollToFile = (nextIndex) => {
        const safeIndex = Math.max(0, Math.min(nextIndex, files.length - 1));
        const container = carouselRef.current;

        if (!container) return;

        container.scrollTo({
            left: safeIndex * container.clientWidth,
            behavior: 'smooth',
        });
        setActiveIndex(safeIndex);
    };

    const handleScroll = () => {
        const container = carouselRef.current;
        if (!container?.clientWidth) return;

        setActiveIndex(Math.round(container.scrollLeft / container.clientWidth));
    };

    if (!files?.length) {
        return (
            <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                Aucun fichier
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">
                    Fichier {activeIndex + 1} sur {files.length}
                </span>
                {files.length > 1 && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => scrollToFile(activeIndex - 1)}
                            disabled={activeIndex === 0}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Fichier pr\u00E9c\u00E9dent"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToFile(activeIndex + 1)}
                            disabled={activeIndex === files.length - 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Fichier suivant"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
            <div
                ref={carouselRef}
                onScroll={handleScroll}
                className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {files.map((lessonFile) => (
                    <div key={lessonFile.id} className="w-full min-w-full snap-start">
                        <p className="mb-1 truncate text-xs font-medium text-slate-500">
                            {lessonFile.original_name}
                        </p>
                        <MediaPreview
                            source={lessonFile.file_path}
                            mimeType={lessonFile.mime_type ?? ''}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

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
    const [lessonFilePreviews, setLessonFilePreviews] = useState([]);
    const [lessonMenuId, setLessonMenuId] = useState(null);
    const [publishingLessonId, setPublishingLessonId] = useState(null);

    const selectedCourse = useMemo(
        () => courses.find((course) => course.id === selectedCourseId) ?? null,
        [courses, selectedCourseId],
    );

    const selectedModule = useMemo(
        () => selectedCourse?.modules?.find((module) => module.id === selectedModuleId) ?? null,
        [selectedCourse, selectedModuleId],
    );

    const editingLesson = useMemo(
        () => selectedModule?.lessons?.find((lesson) => lesson.id === lessonAction.item?.id) ?? lessonAction.item,
        [selectedModule, lessonAction.item],
    );

    const visibleEditingFiles = useMemo(
        () => (editingLesson?.files ?? []).filter(
            (file) => !lessonForm.deleted_file_ids.includes(file.id),
        ),
        [editingLesson, lessonForm.deleted_file_ids],
    );

    const deletedEditingFiles = useMemo(
        () => (editingLesson?.files ?? []).filter(
            (file) => lessonForm.deleted_file_ids.includes(file.id),
        ),
        [editingLesson, lessonForm.deleted_file_ids],
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

    useEffect(() => {
        if (!lessonForm.lesson_files.length) {
            setLessonFilePreviews([]);
            return undefined;
        }

        const previews = lessonForm.lesson_files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setLessonFilePreviews(previews);

        return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    }, [lessonForm.lesson_files]);

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

    const openCreateLessonModal = (requestedModule = null) => {
        const targetModule = requestedModule?.id ? requestedModule : selectedModule;
        if (!targetModule) return;

        const nextPosition = Math.max(
            0,
            ...(targetModule.lessons ?? []).map((lesson) => Number(lesson.position) || 0),
        ) + 1;

        setSelectedModuleId(targetModule.id);
        setLessonAction({ mode: 'create', item: null, moduleId: targetModule.id });
        setLessonForm({
            ...emptyLessonForm,
            position: String(nextPosition),
            lesson_type_id: lessonTypes[0]?.id ? String(lessonTypes[0].id) : '',
        });
        setLessonErrors({});
        setLessonModalOpen(true);
    };

    const openEditLessonModal = (lesson) => {
        setLessonAction({ mode: 'edit', item: lesson, moduleId: selectedModule?.id });
        setLessonForm({
            title: lesson.title ?? '',
            description: lesson.description ?? '',
            lesson_files: [],
            deleted_file_ids: [],
            duration: lesson.duration ?? '',
            position: String(lesson.position ?? ''),
            is_published: Boolean(lesson.is_published),
            lesson_type_id: lesson.lesson_type_id ? String(lesson.lesson_type_id) : '',
        });
        setLessonErrors({});
        setLessonModalOpen(true);
    };

    const handleLessonFileChange = (event) => {
        const input = event.target;
        const newFiles = Array.from(input.files ?? []);
        const oversizedFile = newFiles.find((file) => file.size > maxLessonFileSize);

        if (oversizedFile) {
            input.value = '';
            setLessonErrors((current) => ({
                ...current,
                lesson_files: [`Le fichier "${oversizedFile.name}" d\u00E9passe la taille maximale de 500 Mo.`],
            }));
            return;
        }

        const existingKeys = new Set(
            lessonForm.lesson_files.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
        );
        const uniqueNewFiles = newFiles.filter(
            (file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`),
        );
        const combinedFiles = [...lessonForm.lesson_files, ...uniqueNewFiles];

        if (combinedFiles.length > 4) {
            setLessonErrors((errors) => ({
                ...errors,
                lesson_files: ['Vous pouvez envoyer au maximum 4 fichiers \u00E0 la fois. Retirez un fichier avant d\u2019en ajouter un autre.'],
            }));
            input.value = '';
            return;
        }

        setLessonErrors((errors) => ({ ...errors, lesson_files: undefined }));
        setLessonForm((current) => ({ ...current, lesson_files: combinedFiles }));

        input.value = '';
    };

    const removePendingLessonFile = (fileToRemove) => {
        setLessonForm((current) => ({
            ...current,
            lesson_files: current.lesson_files.filter((file) => file !== fileToRemove),
        }));
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
        const targetModuleId = lessonAction.moduleId ?? selectedModule.id;
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
            lessonForm.lesson_files.forEach((file) => payload.append('lesson_files[]', file));
            lessonForm.deleted_file_ids.forEach((fileId) => payload.append('deleted_file_ids[]', String(fileId)));

            const response = lessonAction.mode === 'edit' && lessonAction.item
                ? await axios.post(
                    route('admin.lms.courses.modules.lessons.update', [selectedCourse.id, targetModuleId, lessonAction.item.id]),
                    (() => {
                        payload.append('_method', 'put');
                        return payload;
                    })(),
                    { headers: { 'Content-Type': 'multipart/form-data' } },
                )
                : await axios.post(
                    route('admin.lms.courses.modules.lessons.store', [selectedCourse.id, targetModuleId]),
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

    const toggleLessonPublication = async (lesson, isPublished) => {
        if (!selectedCourse || !selectedModule) return;

        setPublishingLessonId(lesson.id);
        setFeedback(null);

        try {
            const response = await axios.patch(
                route('admin.lms.courses.modules.lessons.publication', [
                    selectedCourse.id,
                    selectedModule.id,
                    lesson.id,
                ]),
                { is_published: isPublished },
            );

            reloadData(() => {
                setFeedback({
                    type: 'success',
                    message: response?.data?.message ?? 'Le statut de publication a \u00E9t\u00E9 mis \u00E0 jour.',
                });
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: resolveErrorMessage(error, 'Impossible de modifier la publication de la leçon.'),
            });
        } finally {
            setPublishingLessonId(null);
        }
    };

    const askDeleteLessonFile = (lessonFile) => {
        setLessonForm((current) => ({
            ...current,
            deleted_file_ids: [...new Set([...current.deleted_file_ids, lessonFile.id])],
        }));
    };

    const restoreLessonFile = (fileId) => {
        setLessonForm((current) => ({
            ...current,
            deleted_file_ids: current.deleted_file_ids.filter((id) => id !== fileId),
        }));
    };

    const askDeleteCourse = (course) => {
        setConfirmState({
            title: 'Supprimer le cours',
            message: `Voulez-vous vraiment supprimer "${course.name}" ? Les modules et les leçons associ\u00E9es seront \u00E9galement supprim\u00E9es.`,
            onConfirm: async () => {
                setProcessing(true);
                try {
                    const response = await axios.delete(route('admin.lms.courses.destroy', course.id));
                    reloadData(() => {
                        setConfirmModalOpen(false);
                        setSelectedCourseId(null);
                        setSelectedModuleId(null);
                        setFeedback({ type: 'success', message: response?.data?.message ?? 'Le cours a \u00E9t\u00E9 supprim\u00E9 avec succ\u00E8s.' });
                    });
                } catch (error) {
                    setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d\u2019effectuer cette suppression.') });
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
            message: `Voulez-vous vraiment supprimer "${module.title}" ? Les leçons de ce module seront \u00E9galement supprim\u00E9es.`,
            onConfirm: async () => {
                setProcessing(true);
                try {
                    const response = await axios.delete(route('admin.lms.courses.modules.destroy', [selectedCourse.id, module.id]));
                    reloadData(() => {
                        setConfirmModalOpen(false);
                        setSelectedModuleId(null);
                        setFeedback({ type: 'success', message: response?.data?.message ?? 'Le module a \u00E9t\u00E9 supprim\u00E9 avec succ\u00E8s.' });
                    });
                } catch (error) {
                    setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d\u2019effectuer cette suppression.') });
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
            title: 'Supprimer la leçon',
            message: `Voulez-vous vraiment supprimer "${lesson.title}" ?`,
            onConfirm: async () => {
                setProcessing(true);
                try {
                    const response = await axios.delete(
                        route('admin.lms.courses.modules.lessons.destroy', [selectedCourse.id, selectedModule.id, lesson.id]),
                    );
                    reloadData(() => {
                        setConfirmModalOpen(false);
                        setFeedback({ type: 'success', message: response?.data?.message ?? 'La leçon a \u00E9t\u00E9 supprim\u00E9e avec succ\u00E8s.' });
                    });
                } catch (error) {
                    setFeedback({ type: 'error', message: resolveErrorMessage(error, 'Impossible d\u2019effectuer cette suppression.') });
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
                            Administrez les cours, leurs modules et leurs Leçons depuis une seule interface.
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
                            DÃ©finissez le libellÃ© principal et la description du cours.
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
                            {processing ? 'Enregistrement...' : courseAction.mode === 'edit' ? 'Mettre \u00E0 jour' : 'Cr\u00E9er le cours'}
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
                            {selectedCourse ? `Cours concern\u00E9 : ${selectedCourse.name}` : `S\u00E9lectionnez d\u2019abord un cours.`}
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
                            {processing ? 'Enregistrement...' : moduleAction.mode === 'edit' ? 'Mettre \u00E0 jour' : 'Cr\u00E9er le module'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={lessonModalOpen} onClose={closeLessonModal} maxWidth="6xl">
                <form onSubmit={submitLesson} className="flex max-h-[92vh] flex-col">
                    <div className="shrink-0 border-b border-dark-100 px-6 py-5">
                        <h2 className="text-2xl font-bold text-dark-900">
                            {lessonAction.mode === 'edit' ? 'Modifier la leçon' : 'Ajouter une leçon'}
                        </h2>
                        <p className="mt-1 text-sm text-dark-500">
                            {selectedModule ? `Module concern\u00E9 : ${selectedModule.title}` : `S\u00E9lectionnez d\u2019abord un module.`}
                        </p>
                    </div>

                    <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                        <div className="space-y-5 border-b border-dark-100 p-6 lg:border-b-0 lg:border-r">
                            <div>
                                <h3 className="font-semibold text-dark-900">Informations de la leÃ§on</h3>
                                <p className="mt-1 text-xs text-dark-500">Renseignez les informations pÃ©dagogiques principales.</p>
                            </div>
                            <FormInput
                                label="Titre de la leçon"
                                name="title"
                                value={lessonForm.title}
                                onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))}
                                error={lessonErrors.title}
                                required
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormSelect
                                    label="Type de leçon"
                                    name="lesson_type_id"
                                    value={lessonForm.lesson_type_id}
                                    onChange={(event) => setLessonForm((current) => ({ ...current, lesson_type_id: event.target.value }))}
                                    error={lessonErrors.lesson_type_id}
                                    required
                                >
                                    <option value="">SÃ©lectionner</option>
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
                            </div>
                            <FormInput
                                label="Dur\u00E9e (minutes)"
                                name="duration"
                                type="number"
                                value={lessonForm.duration}
                                onChange={(event) => setLessonForm((current) => ({ ...current, duration: event.target.value }))}
                                error={lessonErrors.duration}
                            />
                            <FormTextarea
                                label="Description"
                                name="description"
                                value={lessonForm.description}
                                onChange={(event) => setLessonForm((current) => ({ ...current, description: event.target.value }))}
                                error={lessonErrors.description}
                                rows={5}
                            />
                            <label className="flex items-center gap-3 rounded-xl border border-dark-200 bg-dark-50 px-4 py-3 text-sm text-dark-700">
                                <input
                                    type="checkbox"
                                    checked={lessonForm.is_published}
                                    onChange={(event) => setLessonForm((current) => ({ ...current, is_published: event.target.checked }))}
                                    className="rounded border-dark-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                Publier immÃ©diatement cette leÃ§on
                            </label>
                            {lessonErrors.is_published && <p className="text-sm text-red-600">{lessonErrors.is_published}</p>}
                        </div>

                        <div className="min-w-0 space-y-5 bg-slate-50/60 p-6">
                            <div>
                                <h3 className="font-semibold text-dark-900">{'Fichiers et m\u00E9dias'}</h3>
                                <p className="mt-1 text-xs text-dark-500">Ajoutez jusqu'Ã  4 fichiers par envoi, 500 Mo maximum par fichier.</p>
                            </div>
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                                <PlusIcon className="h-8 w-8 text-emerald-600" />
                                <span className="mt-2 text-sm font-semibold text-emerald-700">Choisir des fichiers</span>
                                <span className="mt-1 text-xs text-dark-500">{'Images, vid\u00E9os, audios ou PDF'}</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,audio/*,application/pdf"
                                    onChange={handleLessonFileChange}
                                    className="sr-only"
                                />
                            </label>
                            {(lessonErrors.lesson_files || lessonErrors['lesson_files.0']) && (
                                <p className="text-sm text-red-600">
                                    {lessonErrors.lesson_files || lessonErrors['lesson_files.0']}
                                </p>
                            )}
                            {lessonForm.deleted_file_ids.length > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                                    <p className="font-semibold">
                                        {lessonForm.deleted_file_ids.length} fichier(s) seront supprimÃ©s avec ? Mettre Ã  jour ?.
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        {deletedEditingFiles.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between gap-3">
                                                <span className="truncate">{file.original_name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => restoreLessonFile(file.id)}
                                                    className="shrink-0 font-semibold text-amber-900 underline"
                                                >
                                                    Restaurer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-2">
                                {lessonFilePreviews.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-emerald-700">
                                            Nouveaux fichiers ({lessonFilePreviews.length})
                                        </p>
                                        {lessonFilePreviews.map((preview) => (
                                            <div key={`${preview.file.name}-${preview.file.lastModified}`} className="rounded-2xl border border-emerald-100 bg-white p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <p className="truncate text-xs font-medium text-dark-600">{preview.file.name}</p>
                                                    <button type="button" onClick={() => removePendingLessonFile(preview.file)} className="inline-flex shrink-0 items-center text-xs font-semibold text-red-600 hover:text-red-700">
                                                        <TrashIcon className="mr-1 h-4 w-4" /> Retirer
                                                    </button>
                                                </div>
                                                <MediaPreview source={preview.url} mimeType={preview.file.type} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {lessonAction.mode === 'edit' && visibleEditingFiles.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-dark-700">
                                            Fichiers enregistr?s ({visibleEditingFiles.length})
                                        </p>
                                        {visibleEditingFiles.map((lessonFile) => (
                                            <div key={lessonFile.id} className="rounded-2xl border border-dark-200 bg-white p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <p className="truncate text-xs font-medium text-dark-600">{lessonFile.original_name}</p>
                                                    <button type="button" onClick={() => askDeleteLessonFile(lessonFile)} className="inline-flex shrink-0 items-center text-xs font-semibold text-red-600 hover:text-red-700">
                                                        <TrashIcon className="mr-1 h-4 w-4" /> Supprimer
                                                    </button>
                                                </div>
                                                <MediaPreview source={lessonFile.file_path} mimeType={lessonFile.mime_type ?? ''} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!lessonFilePreviews.length && !visibleEditingFiles.length && (
                                    <div className="rounded-2xl border border-dashed border-dark-200 bg-white px-5 py-10 text-center text-sm text-dark-400">
                                        Aucun fichier sÃ©lectionnÃ©.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 justify-end gap-3 border-t border-dark-100 bg-white px-6 py-4">
                        <SecondaryButton onClick={closeLessonModal} disabled={processing}>Annuler</SecondaryButton>
                        <PrimaryButton type="submit" className={greenButtonClass} disabled={processing || !lessonTypes.length}>
                            {processing ? 'Enregistrement...' : lessonAction.mode === 'edit' ? 'Mettre \u00E0 jour' : 'Cr\u00E9er la leçon'}
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
                                <p className="mt-1 text-sm text-dark-500">Choisissez un cours pour gÃ©rer sa structure.</p>
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
                                            <span className="rounded-full bg-dark-100 px-3 py-1 text-dark-600">{course.lessons_count} Leçons</span>
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
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-dark-900">
                                                {'leçons du module'}
                                            </h2>
                                            <p className="mt-1 text-base font-medium text-slate-500">
                                                {selectedModule?.title || 'S\u00e9lectionnez un module'}
                                            </p>
                                        </div>
                                        {selectedModule && (
                                            <PrimaryButton className={greenButtonClass} onClick={openCreateLessonModal} disabled={!lessonTypes.length}>
                                                <PlusIcon className="mr-2 h-5 w-5" />
                                                {'Ajouter une leçon'}
                                            </PrimaryButton>
                                        )}
                                    </div>

                                    <div className="mt-7">
                                        {!selectedModule ? (
                                            <div className="rounded-2xl border border-dashed border-dark-200 px-5 py-10 text-center text-sm text-dark-500">
                                                {'S\u00e9lectionnez un module pour consulter ou g\u00e9rer ses leçons.'}
                                            </div>
                                        ) : selectedModule.lessons.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-dark-200 px-5 py-10 text-center text-sm text-dark-500">
                                                {'Aucune leçon n\u2019a encore \u00e9t\u00e9 ajout\u00e9e \u00e0 ce module.'}
                                            </div>
                                        ) : (
                                            <div className="space-y-5">
                                                {selectedModule.lessons.map((lesson) => (
                                                    <article key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                                                        <div className="grid gap-5 xl:grid-cols-[58px_minmax(0,1fr)_minmax(260px,340px)] xl:items-start">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-lg font-bold text-amber-700">
                                                                {lesson.position}
                                                            </div>
                                                            <div className="min-w-0 xl:pr-2">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                                        {`leçon ${lesson.position}`}
                                                                    </span>
                                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                                        {lesson.lesson_type?.name || 'Type non d\u00e9fini'}
                                                                    </span>
                                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                        lesson.is_published
                                                                            ? 'bg-emerald-100 text-emerald-700'
                                                                            : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        {lesson.is_published ? 'Publi\u00e9e' : 'Brouillon'}
                                                                    </span>
                                                                    <label className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={Boolean(lesson.is_published)}
                                                                            disabled={publishingLessonId === lesson.id}
                                                                            onChange={(event) => toggleLessonPublication(lesson, event.target.checked)}
                                                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                                                                        />
                                                                        {publishingLessonId === lesson.id ? 'Enregistrement...' : 'Rendre publique'}
                                                                    </label>
                                                                </div>
                                                                <h3 className="mt-3 text-lg font-semibold text-dark-900">{lesson.title}</h3>
                                                                <p className="mt-2 max-w-2xl text-sm leading-7 text-dark-500">
                                                                    {lesson.description || 'Aucune description'}
                                                                </p>
                                                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                                                                    <ClockIcon className="h-5 w-5" />
                                                                    <span>{lesson.duration ? `${lesson.duration} min` : 'Dur\u00e9e non d\u00e9finie'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 space-y-4">
                                                                <LessonFilesCarousel files={lesson.files ?? []} />
                                                                <div className="relative flex flex-wrap items-center gap-3">
                                                                    <SecondaryButton className="!rounded-xl !px-4 !py-3" onClick={() => openEditLessonModal(lesson)}>
                                                                        <PencilSquareIcon className="mr-2 h-4 w-4" />
                                                                        Modifier
                                                                    </SecondaryButton>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setLessonMenuId((current) => (current === lesson.id ? null : lesson.id))}
                                                                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                                                                        aria-label={'Actions de la leçon'}
                                                                    >
                                                                        <EllipsisHorizontalIcon className="h-6 w-6" />
                                                                    </button>
                                                                    {lessonMenuId === lesson.id && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setLessonMenuId(null);
                                                                                askDeleteLesson(lesson);
                                                                            }}
                                                                            className="absolute left-0 top-full z-10 mt-2 inline-flex items-center rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-lg hover:bg-red-50"
                                                                        >
                                                                            <TrashIcon className="mr-2 h-5 w-5" />
                                                                            Supprimer
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-dark-200 bg-white px-6 py-16 text-center text-dark-500 shadow-sm">
                                {'Cr\u00E9ez un premier cours pour commencer la structuration du contenu p\u00E9dagogique.'}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
