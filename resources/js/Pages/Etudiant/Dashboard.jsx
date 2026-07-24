import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';

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
                            <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <BookOpenIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-slate-900">{course.name}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {course.description || 'Aucune description disponible pour ce cours.'}
                                </p>
                            </article>
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
