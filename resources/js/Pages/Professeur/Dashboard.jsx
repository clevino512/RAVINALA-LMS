import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { AcademicCapIcon, BookOpenIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ courses, studentCount }) {
    return (
        <AppLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Espace professeur</h1>
                    <p className="mt-1 text-sm text-slate-500">Consultez vos cours et les étudiants qui y sont inscrits.</p>
                </div>
            }
        >
            <Head title="Espace professeur" />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 p-6 text-white shadow-lg">
                    <BookOpenIcon className="h-9 w-9" />
                    <p className="mt-4 text-sm font-medium text-emerald-100">Mes cours</p>
                    <p className="mt-1 text-4xl font-bold">{courses.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <UsersIcon className="h-9 w-9 text-blue-600" />
                    <p className="mt-4 text-sm font-medium text-slate-500">Étudiants uniques</p>
                    <p className="mt-1 text-4xl font-bold text-slate-900">{studentCount}</p>
                </div>
            </div>

            <div className="mt-6 space-y-5">
                {courses.length > 0 ? courses.map((course) => (
                    <section key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <AcademicCapIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{course.name}</h2>
                                <p className="text-sm text-slate-500">{course.description || 'Aucune description'}</p>
                            </div>
                            <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {course.users.length} étudiant{course.users.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        {course.users.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {course.users.map((student) => (
                                    <div key={student.id} className="flex items-center gap-4 px-6 py-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                                            {student.first_name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-slate-900">{student.name}</p>
                                            <p className="truncate text-sm text-slate-500">{student.email || 'E-mail non renseigné'}</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {student.status?.name || 'Statut inconnu'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="px-6 py-10 text-center text-sm text-slate-500">Aucun étudiant inscrit à ce cours.</p>
                        )}
                    </section>
                )) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <BookOpenIcon className="mx-auto h-10 w-10 text-slate-400" />
                        <p className="mt-4 font-semibold text-slate-700">Aucun cours ne vous est encore attribué.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
