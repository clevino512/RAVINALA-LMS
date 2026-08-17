import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { AcademicCapIcon, ArrowRightIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ courses }) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mon espace étudiant</h1>
                    <p className="mt-1 text-sm text-slate-500">Retrouvez uniquement les cours qui vous sont attribués.</p>
                </div>
            }
        >
            <Head title="Mes cours" />

            <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 p-6 text-white shadow-lg">
                <AcademicCapIcon className="h-10 w-10" />
                <p className="mt-4 text-sm font-medium text-emerald-100">Cours disponibles</p>
                <p className="mt-1 text-4xl font-bold">{courses.length}</p>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-900">Mes cours</h2>
                <p className="mt-1 text-sm text-slate-500">Les matières auxquelles vous avez accès.</p>

                {courses.length > 0 ? (
                    <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={route('etudiant.courses.index', { course: course.id })}
                                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <BookOpenIcon className="h-6 w-6" />
                                    </div>
                                    {course.is_completed && (
                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <CheckCircleIcon className="mr-1 h-4 w-4" />Terminé
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-900">{course.name}</h3>
                                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                                    {course.description || 'Aucune description disponible pour ce cours.'}
                                </p>
                                <div className="mt-6">
                                    <div className="flex items-center justify-between text-sm font-semibold">
                                        <span className="text-slate-600">Progression</span>
                                        <span className="text-emerald-700">{course.progress_percentage}%</span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${course.progress_percentage}%` }} />
                                    </div>
                                    <div className="mt-5 flex items-center justify-end text-sm font-semibold text-emerald-700">
                                        Accéder aux leçons
                                        <ArrowRightIcon className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <BookOpenIcon className="mx-auto h-10 w-10 text-slate-400" />
                        <p className="mt-4 font-semibold text-slate-700">Aucun cours ne vous est encore attribué.</p>
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
