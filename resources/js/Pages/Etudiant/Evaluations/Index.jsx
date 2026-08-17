import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Index({ assessments }) {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [uploading, setUploading] = useState(null);

    const start = async (assessment) => { const { data } = await axios.post(route('etudiant.evaluations.quiz.start', assessment.id)); setQuiz({ assessment, ...data }); setAnswers({}); setResult(null); };
    const submitQuiz = async () => { const { data } = await axios.post(route('etudiant.evaluations.quiz.submit', [quiz.assessment.id, quiz.attempt_id]), { answers }); setResult(data); setQuiz(null); router.reload({ only: ['assessments'] }); };
    const upload = async (assessment, file) => {
        if (!file) return;
        const allowedTypes = ['application/pdf', 'video/mp4', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) return alert('Format refusé. Choisissez un fichier PDF, MP4, JPG ou PNG.');
        if (file.size > 100 * 1024 * 1024) return alert('Le fichier dépasse la taille maximale de 100 Mo.');

        setUploading(assessment.id);
        const body = new FormData();
        body.append('file', file);
        try {
            await axios.post(route('etudiant.evaluations.assignment.submit', assessment.id), body);
            alert('Votre copie a été déposée avec succès.');
            router.reload({ only: ['assessments'] });
        } catch (error) {
            alert(error.response?.data?.errors?.file?.[0] || error.response?.data?.message || 'Dépôt impossible.');
        } finally {
            setUploading(null);
        }
    };

    return <AppLayout header={<div><h1 className="text-2xl font-bold text-slate-900">Mes évaluations</h1><p className="mt-1 text-sm text-slate-500">Passez vos quiz et déposez vos devoirs.</p></div>}>
        <Head title="Mes évaluations" />
        <div className="space-y-5">{assessments.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Aucune évaluation publiée.</div> : assessments.map((assessment) => <article key={assessment.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex gap-2"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{assessment.type === 'quiz' ? 'Quiz' : 'Devoir'}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{assessment.course}</span></div><h2 className="mt-3 text-xl font-bold">{assessment.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{assessment.instructions || 'Aucune instruction.'}</p>{assessment.attachment_url && <a href={assessment.attachment_url} className="mt-2 inline-block text-sm font-semibold text-emerald-700 underline">Télécharger le sujet : {assessment.attachment_name}</a>}{assessment.due_at && <p className="mt-2 text-sm font-semibold text-amber-700">Date limite : {assessment.due_at}</p>}</div><ClipboardDocumentCheckIcon className="h-10 w-10 text-emerald-600" /></div>
            {assessment.type === 'quiz' ? <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={() => start(assessment)} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Commencer une tentative</button><span className="text-sm text-slate-500">{assessment.attempts_count} tentative(s){assessment.best_score !== null ? ` • meilleur score ${assessment.best_score}` : ''}</span></div> : (() => {
                const deadlinePassed = assessment.due_at && new Date(assessment.due_at).getTime() < Date.now();
                return <div className="mt-5">{deadlinePassed ? <p className="inline-flex rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">La date limite est dépassée : le dépôt est fermé.</p> : <label className={`inline-flex items-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white ${uploading === assessment.id ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}><input type="file" accept=".pdf,.mp4,.jpg,.jpeg,.png,application/pdf,video/mp4,image/jpeg,image/png" className="hidden" disabled={uploading === assessment.id} onChange={(e) => upload(assessment, e.target.files?.[0])} />{uploading === assessment.id ? 'Envoi en cours...' : assessment.submission ? 'Remplacer ma copie' : 'Déposer ma copie'}</label>}<p className="mt-2 text-xs text-slate-500">Travail accepté : PDF, vidéo MP4 ou image JPG/PNG — 100 Mo maximum.</p>{assessment.submission && <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="font-semibold">Copie remise : {assessment.submission.original_name}</p><a href={assessment.submission.view_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-emerald-700 underline">Ouvrir ma copie</a>{assessment.submission.grade !== null ? <><p className="mt-2 font-bold text-emerald-700">Note : {assessment.submission.grade}/100</p><p className="mt-1 text-sm text-slate-600">Feedback du correcteur : {assessment.submission.feedback}</p></> : <p className="mt-2 text-sm text-amber-700">Copie transmise, en attente de correction.</p>}</div>}</div>;
            })()}
        </article>)}</div>

        {quiz && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4"><div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white p-6 shadow-xl"><h2 className="text-2xl font-bold">{quiz.assessment.title}</h2><p className="mt-1 text-sm text-slate-500">Questions tirées aléatoirement pour cette tentative.</p><div className="mt-6 space-y-6">{quiz.questions.map((question, index) => <fieldset key={question.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-bold">{index + 1}. {question.prompt}</legend><div className="mt-3 space-y-2">{question.options.map((option) => <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${answers[question.id] === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}><input type="radio" name={`q-${question.id}`} checked={answers[question.id] === option.id} onChange={() => setAnswers({ ...answers, [question.id]: option.id })} />{option.text}</label>)}</div></fieldset>)}</div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setQuiz(null)} className="rounded-xl border px-4 py-3 font-semibold">Annuler</button><button onClick={submitQuiz} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Valider mes réponses</button></div></div></div>}

        {result && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4"><div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white p-6 shadow-xl"><div className="flex items-center gap-3"><CheckCircleIcon className="h-10 w-10 text-emerald-600" /><div><h2 className="text-2xl font-bold">Résultat : {result.percentage}%</h2><p className="text-slate-500">{result.score}/{result.total} bonne(s) réponse(s)</p></div></div><div className="mt-6 space-y-3">{result.results.map((item, index) => <div key={index} className={`rounded-2xl border p-4 ${item.is_correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}><p className="font-semibold">{item.question}</p><p className="mt-2 text-sm">Votre réponse : {item.selected_answer || 'Aucune'}</p><p className="mt-1 text-sm font-semibold text-emerald-700">Bonne réponse : {item.correct_answer}</p></div>)}</div><button onClick={() => setResult(null)} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Fermer</button></div></div>}
    </AppLayout>;
}
