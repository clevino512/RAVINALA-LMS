<?php

namespace App\Http\Controllers\Professeur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = $request->user()
            ->courses()
            ->with([
                'users' => fn ($query) => $query
                    ->whereHas('userType', fn ($typeQuery) => $typeQuery->whereIn('name', ['étudiant', 'etudiant', 'student']))
                    ->with('status')
                    ->orderBy('first_name'),
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('Professeur/Dashboard', [
            'courses' => $courses,
            'studentCount' => $courses->flatMap(fn ($course) => $course->users)->unique('id')->count(),
        ]);
    }
}
