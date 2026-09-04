import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircleIcon, ClipboardDocumentCheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const emptyQuestion = () => ({ type: 'multiple_choice', prompt: '', options: ['', '', '', ''], correct_option: 0 });

export default function Manage({ courses, assessments, routePrefix, flashSuccess }) {
    const initialForm = () => ({ course_id: courses[0]?.id ?? '', type: 'quiz', title: '', instructions: '', attachment: null, due_at: '', random_question_count: 1, is_published: false, questions: [emptyQuestion()] });
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [grades, setGrades] = useState({});

    const updateQuestion = (index, changes) => setForm((current) => ({ ...current, questions: current.questions.map((question, i) => i === index ? { ...question, ...changes } : question) }));
    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setErrors({});
        const payload = form.type === 'assignment'
            ? {
                course_id: form.course_id,
                type: form.type,
                title: form.title,
                instructions: form.instructions,
                attachment: form.attachment,
                due_at: form.due_at,
                is_published: form.is_published,
            }
            : {
                course_id: form.course_id,
                type: form.type,
                title: form.title,
                instructions: form.instructions,
                random_question_count: form.random_question_count,
                is_published: form.is_published,
                questions: form.questions,
            };
        router.post(route(`${routePrefix}.store`), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setForm(initialForm()),
            onError: (validationErrors) => setErrors(validationErrors),
            onFinish: () => setSaving(false),
        });
    };

    const grade = async (assessmentId, submission) => {
        const changes = grades[submission.id] ?? {};
        const value = {
            grade: changes.grade ?? submission.grade,
            feedback: changes.feedback ?? submission.feedback,
        };
        try { await axios.patch(route(`${routePrefix}.grade`, [assessmentId, submission.id]), value); router.reload({ only: ['assessments'] }); }
        catch (error) { alert(error.response?.data?.message || 'Correction impossible.'); }
    };

    return <AppLayout header={<div><h1 className="text-2xl font-bold text-slate-900">Évaluations, quiz & devoirs</h1><p className="mt-1 text-sm text-slate-500">Créez des QCM, des questions Vrai/Faux et des devoirs à corriger.</p></div>}>
        <Head title="Évaluations" />
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)] xl:items-start">
            <form onSubmit={submit} noValidate className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
                <div className="flex items-center gap-3"><ClipboardDocumentCheckIcon className="h-7 w-7 text-emerald-600" /><h2 className="text-xl font-bold">Créer une évaluation</h2></div>
                {flashSuccess && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{flashSuccess}</p>}
                {Object.keys(errors).length > 0 && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><p className="font-bold">Le devoir n’a pas été créé :</p><ul className="mt-1 list-disc pl-5">{Object.values(errors).flat().map((message, index) => <li key={index}>{message}</li>)}</ul></div>}
                <div className="mt-5 space-y-4">
                    <label className="block text-sm font-semibold">Cours<select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })} className="mt-1 w-full rounded-xl border-slate-300">{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                    <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setForm({ ...form, type: 'quiz', attachment: null, due_at: '' })} className={`rounded-xl border p-3 font-semibold ${form.type === 'quiz' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'}`}>Quiz</button><button type="button" onClick={() => setForm({ ...form, type: 'assignment' })} className={`rounded-xl border p-3 font-semibold ${form.type === 'assignment' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'}`}>Devoir</button></div>
                    <label className="block text-sm font-semibold">Titre<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border-slate-300" required /></label>
                    <label className="block text-sm font-semibold">Instructions<textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows="3" className="mt-1 w-full rounded-xl border-slate-300" /></label>
                    {form.type === 'assignment' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-900">Déposez le sujet et fixez la date limite. Les étudiants remettront ensuite leur réponse.</p><label className="mt-3 block text-sm font-semibold">Fichier du devoir<input type="file" accept=".pdf,.mp4,.jpg,.jpeg,.png,application/pdf,video/mp4,image/jpeg,image/png" onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] ?? null })} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-2 text-sm" required /></label><p className="mt-1 text-xs text-slate-600">PDF, MP4, JPG ou PNG — 100 Mo maximum.</p><label className="mt-3 block text-sm font-semibold">Date limite de remise<input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} className="mt-1 w-full rounded-xl border-slate-300 bg-white" required /></label></div>}
                    {form.type === 'quiz' && <>
                        <label className="block text-sm font-semibold">Questions tirées par tentative<input type="number" min="1" max={form.questions.length} value={form.random_question_count} onChange={(e) => setForm({ ...form, random_question_count: Number(e.target.value) })} className="mt-1 w-full rounded-xl border-slate-300" /></label>
                        <div className="space-y-4">{form.questions.map((question, index) => <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex justify-between gap-2"><strong>Question {index + 1}</strong>{form.questions.length > 1 && <button type="button" onClick={() => setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) })} className="text-red-600"><TrashIcon className="h-5 w-5" /></button>}</div>
                            <select value={question.type} onChange={(e) => updateQuestion(index, { type: e.target.value, options: e.target.value === 'true_false' ? ['Vrai', 'Faux'] : ['', '', '', ''], correct_option: 0 })} className="mt-3 w-full rounded-xl border-slate-300 text-sm"><option value="multiple_choice">QCM</option><option value="true_false">Vrai / Faux</option></select>
                            <textarea placeholder="Énoncé" value={question.prompt} onChange={(e) => updateQuestion(index, { prompt: e.target.value })} className="mt-3 w-full rounded-xl border-slate-300 text-sm" required />
                            <div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => <label key={optionIndex} className="flex items-center gap-2"><input type="radio" checked={question.correct_option === optionIndex} onChange={() => updateQuestion(index, { correct_option: optionIndex })} /><input disabled={question.type === 'true_false'} value={option} onChange={(e) => updateQuestion(index, { options: question.options.map((o, i) => i === optionIndex ? e.target.value : o) })} placeholder={`Réponse ${optionIndex + 1}`} className="w-full rounded-lg border-slate-300 text-sm" required /></label>)}</div>
                        </div>)}</div>
                        <button type="button" onClick={() => setForm({ ...form, questions: [...form.questions, emptyQuestion()], random_question_count: Math.min(form.random_question_count, form.questions.length + 1) })} className="inline-flex items-center text-sm font-semibold text-emerald-700"><PlusIcon className="mr-1 h-5 w-5" />Ajouter une question</button>
                    </>}
                    <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded text-emerald-600" />Publier immédiatement</label>
                    <button disabled={saving || !courses.length} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Enregistrement...' : form.type === 'assignment' ? 'Créer le devoir' : 'Créer le quiz'}</button>
                </div>
            </form>

            <div className="space-y-5">{assessments.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Aucune évaluation créée.</div> : assessments.map((assessment) => <article key={assessment.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex gap-2"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{assessment.type === 'quiz' ? 'Quiz' : 'Devoir'}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{assessment.course.name}</span></div><h2 className="mt-3 text-xl font-bold">{assessment.title}</h2><p className="mt-2 text-sm text-slate-500">{assessment.instructions || 'Aucune instruction.'}</p>{assessment.attachment_url && <a href={assessment.attachment_url} className="mt-2 inline-block text-sm font-semibold text-emerald-700 underline">Télécharger le sujet : {assessment.attachment_name}</a>}</div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={assessment.is_published} onChange={async (e) => { await axios.patch(route(`${routePrefix}.publication`, assessment.id), { is_published: e.target.checked }); router.reload({ only: ['assessments'] }); }} />Publié</label></div>
                {assessment.type === 'quiz' ? <div className="mt-4"><p className="text-sm font-semibold text-slate-600">{assessment.random_question_count} question(s) tirée(s) parmi {assessment.questions_count}</p><div className="mt-4 space-y-2"><h3 className="font-bold">Résultats ({assessment.attempts.length} tentatives)</h3>{assessment.attempts.length === 0 ? <p className="text-sm text-slate-500">Aucune tentative terminée.</p> : assessment.attempts.map((attempt) => <div key={attempt.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold">{attempt.student}</span><span className="font-bold text-emerald-700">{attempt.score}/{attempt.total} — {attempt.percentage}%</span></div>)}</div></div> : <div className="mt-5 space-y-3"><div><h3 className="font-bold">Copies remises par les étudiants ({assessment.submissions.length})</h3><p className="mt-1 text-sm text-slate-500">Téléchargez une copie, puis saisissez uniquement une note et un feedback écrit.</p></div>{assessment.submissions.length === 0 ? <p className="text-sm text-slate-500">Aucun étudiant n’a encore déposé de copie.</p> : assessment.submissions.map((submission) => <div key={submission.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{submission.student}</p><a href={submission.download_url} className="text-sm text-emerald-700 underline">Télécharger : {submission.original_name}</a></div>{submission.grade !== null && <span className="font-bold text-emerald-700">{submission.grade}/100</span>}</div><div className="mt-3 grid gap-2 sm:grid-cols-[100px_1fr_auto]"><input type="number" min="0" max="100" placeholder="Note /100" defaultValue={submission.grade ?? ''} onChange={(e) => setGrades({ ...grades, [submission.id]: { ...(grades[submission.id] ?? {}), grade: e.target.value } })} className="rounded-xl border-slate-300" /><input placeholder="Feedback écrit obligatoire" defaultValue={submission.feedback ?? ''} onChange={(e) => setGrades({ ...grades, [submission.id]: { ...(grades[submission.id] ?? {}), feedback: e.target.value } })} className="rounded-xl border-slate-300" /><button type="button" onClick={() => grade(assessment.id, submission)} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">{submission.grade !== null && submission.feedback ? 'Modifier la correction' : 'Enregistrer la correction'}</button></div></div>)}</div>}
                <button type="button" onClick={async () => { if (confirm('Supprimer cette évaluation ?')) { await axios.delete(route(`${routePrefix}.destroy`, assessment.id)); router.reload({ only: ['assessments'] }); } }} className="mt-5 inline-flex items-center text-sm font-semibold text-red-600"><TrashIcon className="mr-1 h-5 w-5" />Supprimer</button>
            </article>)}</div>
        </div>
    </AppLayout>;
}
