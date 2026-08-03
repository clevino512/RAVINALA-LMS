import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    AcademicCapIcon,
    ArrowDownTrayIcon,
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    LockClosedIcon,
    PauseIcon,
    PlayIcon,
    SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';

const PLAYBACK_RATE_STORAGE_KEY = 'ravinala-media-playback-rate';
const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

const savedPlaybackRate = () => {
    if (typeof window === 'undefined') return 1;

    const rate = Number(window.localStorage.getItem(PLAYBACK_RATE_STORAGE_KEY));
    return PLAYBACK_RATES.includes(rate) ? rate : 1;
};

const publicMediaUrl = (path) => {
    if (!path) return null;
    if (/^(https?:|blob:|data:)/i.test(path)) return path;

    const normalizedPath = String(path).replace(/^\/+/, '');

    if (normalizedPath.startsWith('lessons/data/') || normalizedPath.startsWith('storage/')) {
        return `/${normalizedPath}`;
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
    const [playbackRate, setPlaybackRate] = useState(savedPlaybackRate);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        const media = mediaRef.current;
        if (!media) return undefined;

        const syncState = () => {
            setCurrentTime(media.currentTime || 0);
            setDuration(media.duration || 0);
            setIsPlaying(!media.paused && !media.ended);
        };

        media.playbackRate = playbackRate;

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
    }, [url, playbackRate]);

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

        window.localStorage.setItem(PLAYBACK_RATE_STORAGE_KEY, String(nextRate));
    };

    return (
        <div className={`${frameClass} ${kind === 'video' ? 'bg-black' : 'p-4'}`}>
            {kind === 'video' ? (
                <video ref={mediaRef} src={url} preload="metadata" controls className="max-h-80 w-full" />
            ) : (
                <audio ref={mediaRef} src={url} preload="metadata" controls className="w-full" />
            )}
            <div className={`space-y-3 ${kind === 'video' ? 'border-t border-white/10 bg-slate-950 p-4 text-white' : ''}`}>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            void togglePlayback();
                        }}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${kind === 'video' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                        aria-label={isPlaying ? 'Mettre en pause' : 'Lire le média'}
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
                        aria-label="Avancer ou reculer dans le média"
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
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <span>Vitesse</span>
                        <select
                            value={playbackRate}
                            onChange={changePlaybackRate}
                            className={`rounded-lg border px-2 py-1 text-sm ${kind === 'video' ? 'border-white/20 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                            aria-label="Vitesse de lecture"
                        >
                            {PLAYBACK_RATES.map((rate) => <option key={rate} value={rate}>{rate}×</option>)}
                        </select>
                    </label>
                </div>
            </div>
        </div>
    );
}

function MediaPreview({ source, mimeType = '', className = '' }) {
    const url = publicMediaUrl(source);
    if (!url) return null;

    const kind = mediaKind(source, mimeType);
    const frameClass = `overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${className}`;

    if (kind === 'image') {
        return <div className={frameClass}><img src={url} alt="Aperçu du fichier" className="h-64 w-full object-contain" /></div>;
    }

    if (kind === 'video') {
        return <MediaPlayer url={url} kind="video" frameClass={frameClass} />;
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
                    <p className="truncate font-semibold text-slate-800">{fileName}</p>
                    <a href={url} download={fileName} className="mt-4 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                        <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                        Télécharger le PDF
                    </a>
                </div>
            </div>
        );
    }

    return <a href={url} target="_blank" rel="noreferrer" className={`${frameClass} block px-4 py-5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50`}>Ouvrir le fichier</a>;
}

function LessonFiles({ files }) {
    if (!files?.length) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-400">
                Aucun fichier disponible.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {files.map((file) => (
                <div key={file.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="truncate text-sm font-semibold text-slate-700">{file.original_name}</p>
                    <MediaPreview source={file.file_path} mimeType={file.mime_type ?? ''} />
                </div>
            ))}
        </div>
    );
}

export default function Index({ courses, stats, initialCourseId }) {
    const initialCourse = courses.find((course) => course.id === initialCourseId) ?? courses[0];
    const [selectedCourseId, setSelectedCourseId] = useState(initialCourse?.id ?? null);
    const [selectedModuleId, setSelectedModuleId] = useState(initialCourse?.current_module_id ?? initialCourse?.modules?.[0]?.id ?? null);
    const [markingLessonId, setMarkingLessonId] = useState(null);

    const selectedCourse = useMemo(
        () => courses.find((course) => course.id === selectedCourseId) ?? null,
        [courses, selectedCourseId],
    );

    useEffect(() => {
        if (!courses.length) {
            setSelectedCourseId(null);
            setSelectedModuleId(null);
            return;
        }

        const hasCurrentCourse = courses.some((course) => course.id === selectedCourseId);
        const nextCourse = hasCurrentCourse ? courses.find((course) => course.id === selectedCourseId) : courses[0];

        if (!hasCurrentCourse) {
            setSelectedCourseId(nextCourse.id);
        }

        const nextModuleId = nextCourse?.current_module_id ?? nextCourse?.modules?.find((module) => module.is_accessible)?.id ?? nextCourse?.modules?.[0]?.id ?? null;
        setSelectedModuleId((current) => {
            const exists = nextCourse?.modules?.some((module) => module.id === current && module.is_accessible);
            return exists ? current : nextModuleId;
        });
    }, [courses, selectedCourseId]);

    const selectedModule = useMemo(
        () => selectedCourse?.modules?.find((module) => module.id === selectedModuleId) ?? null,
        [selectedCourse, selectedModuleId],
    );

    const completeLesson = async (lesson) => {
        if (!selectedCourse || !selectedModule || lesson.is_completed) return;

        setMarkingLessonId(lesson.id);

        try {
            await axios.patch(route('etudiant.courses.modules.lessons.complete', [selectedCourse.id, selectedModule.id, lesson.id]));
            router.reload({ only: ['courses', 'stats'] });
        } finally {
            setMarkingLessonId(null);
        }
    };

    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mes cours</h1>
                    <p className="mt-1 text-sm text-slate-500">Suivez vos cours attribués et avancez module par module.</p>
                </div>
            }
        >
            <Head title="Cours" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <BookOpenIcon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Cours attribués</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.totalCourses}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <AcademicCapIcon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Modules</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.totalModules}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <CheckCircleIcon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Modules terminés</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.completedModules}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                            <ClockIcon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Leçons validées</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.completedLessons}</p>
                    </div>
                </section>

                <section>
                    <div className="space-y-6">
                        {selectedCourse ? (
                            <>
                                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Progression du cours</p>
                                            <h2 className="mt-2 text-3xl font-bold text-slate-900">{selectedCourse.name}</h2>
                                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{selectedCourse.description || 'Aucune description pour ce cours.'}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 px-5 py-4 text-right">
                                            <p className="text-sm text-slate-500">Progression</p>
                                            <p className="text-3xl font-bold text-slate-900">{selectedCourse.progress_percentage}%</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">Modules du cours</h2>
                                            <p className="mt-1 text-sm text-slate-500">Un seul nouveau module se débloque à la fois. Terminez le module courant pour ouvrir le suivant.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                        {selectedCourse.modules.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500 lg:col-span-2">
                                                Aucun module disponible pour ce cours.
                                            </div>
                                        ) : selectedCourse.modules.map((module) => (
                                            <button
                                                key={module.id}
                                                type="button"
                                                onClick={() => module.is_accessible && setSelectedModuleId(module.id)}
                                                disabled={!module.is_accessible}
                                                className={`rounded-3xl border p-5 text-left transition ${module.id === selectedModuleId ? 'border-emerald-300 bg-emerald-50 shadow-sm' : module.is_locked ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-80' : 'border-slate-200 bg-white hover:border-emerald-200'}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Module {module.position}</p>
                                                        <h3 className="mt-3 text-2xl font-bold text-slate-900">{module.title}</h3>
                                                    </div>
                                                    {module.is_locked ? (
                                                        <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"><LockClosedIcon className="mr-1 h-4 w-4" />Verrouillé</span>
                                                    ) : module.is_completed ? (
                                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Terminé</span>
                                                    ) : (
                                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">À faire</span>
                                                    )}
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-slate-500">{module.description || 'Aucune description disponible pour ce module.'}</p>
                                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                                                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${module.progress_percentage}%` }} />
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1">{module.completed_lessons_count}/{module.lessons_count} leçons validées</span>
                                                    {module.is_current && <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Module courant</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">Leçons du module</h2>
                                            <p className="mt-1 text-base font-medium text-slate-500">{selectedModule?.title || 'Sélectionnez un module accessible'}</p>
                                        </div>
                                        {selectedModule && (
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                                    {selectedModule.lessons.length} leçon{selectedModule.lessons.length > 1 ? 's' : ''}
                                                </span>
                                                {selectedModule.is_completed && (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                                                        <CheckCircleIcon className="mr-2 h-5 w-5" />
                                                        Module terminé
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-7">
                                        {!selectedModule ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
                                                Aucun module accessible n'est sélectionné.
                                            </div>
                                        ) : selectedModule.is_locked ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
                                                Terminez d'abord le module précédent pour débloquer celui-ci.
                                            </div>
                                        ) : selectedModule.lessons.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
                                                Aucune leçon publiée pour ce module.
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
                                                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Leçon {lesson.position}</span>
                                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{lesson.lesson_type?.name || 'Type non défini'}</span>
                                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lesson.is_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                        {lesson.is_completed ? 'Terminée' : 'À faire'}
                                                                    </span>
                                                                </div>
                                                                <h3 className="mt-3 text-lg font-semibold text-slate-900">{lesson.title}</h3>
                                                                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">{lesson.description || 'Aucune description'}</p>
                                                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                                                                    <ClockIcon className="h-5 w-5" />
                                                                    <span>{lesson.duration ? `${lesson.duration} min` : 'Durée non définie'}</span>
                                                                </div>
                                                                <div className="mt-5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => completeLesson(lesson)}
                                                                        disabled={lesson.is_completed || markingLessonId === lesson.id}
                                                                        className={`inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${lesson.is_completed ? 'cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700' : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60'}`}
                                                                    >
                                                                        <CheckCircleIcon className="mr-2 h-5 w-5" />
                                                                        {lesson.is_completed ? 'Leçon validée' : markingLessonId === lesson.id ? 'Enregistrement...' : 'Marquer comme terminée'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 space-y-4">
                                                                <LessonFiles files={lesson.files ?? []} />
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
                            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
                                Aucun cours attribué à afficher.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
