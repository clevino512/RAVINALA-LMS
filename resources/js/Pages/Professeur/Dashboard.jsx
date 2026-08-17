import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { AcademicCapIcon, BookOpenIcon, CheckCircleIcon, Squares2X2Icon, UsersIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ courses, stats }) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tableau de bord professeur</h1>
                    <p className="mt-1 text-sm text-slate-500">Vue d’ensemble de vos cours attribués et de vos apprenants.</p>
                </div>
            }
        >
            <Head title="Espace professeur" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <BookOpenIcon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Cours attribués</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.totalCourses}</p>
                    </div>
                    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <Squares2X2Icon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Modules</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.totalModules}</p>
                    </div>
                    <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                            <AcademicCapIcon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Leçons</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.totalLessons}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                            <UsersIcon className="h-7 w-7" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Étudiants uniques</p>
                        <p className="mt-1 text-4xl font-bold text-slate-900">{stats.totalStudents}</p>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Mes cours</h2>
                            <p className="mt-1 text-sm text-slate-500">Retrouvez rapidement vos cours attribués. Pour gérer modules et leçons, ouvrez la section Cours.</p>
                        </div>
                        <Link href={route('professeur.courses.index')} className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                            Ouvrir la section Cours
                        </Link>
                    </div>

                    <div className="grid gap-4 p-5 lg:grid-cols-2">
                        {courses.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 lg:col-span-2">
                                Aucun cours ne vous est attribué pour le moment.
                            </div>
                        ) : courses.map((course) => (
                            <article key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <h3 className="text-lg font-semibold text-slate-900">{course.name}</h3>
                                <p className="mt-2 text-sm text-slate-500">{course.description || 'Aucune description'}</p>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                                    <span className="rounded-full bg-white px-3 py-1">{course.users_count} apprenants</span>
                                    <span className="rounded-full bg-white px-3 py-1">{course.lessons_count} leçons publiées</span>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {course.students.length === 0 ? (
                                        <p className="text-sm text-slate-500">Aucun étudiant inscrit.</p>
                                    ) : course.students.map((student) => (
                                        <div key={student.id} className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900">{student.name}</p>
                                                    <p className="truncate text-slate-500">{student.email || 'E-mail non renseigné'}</p>
                                                </div>
                                                {student.is_completed ? (
                                                    <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                        <CheckCircleIcon className="mr-1 h-4 w-4" />Terminé
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 font-bold text-emerald-700">{student.progress_percentage}%</span>
                                                )}
                                            </div>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${student.progress_percentage}%` }} />
                                            </div>
                                            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                                                <span>{student.completed_lessons_count}/{student.lessons_count} leçons validées</span>
                                                <span>{student.status?.name || 'Statut inconnu'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
