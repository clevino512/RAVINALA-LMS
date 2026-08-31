<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::count();
        $activeUsers = User::whereHas('status', fn ($query) => $query->where('name', 'actif'))->count();
        $totalCourses = Course::count();
        $totalProfessors = User::whereHas('userType', fn ($query) => $query->whereIn('name', ['professeur', 'teacher']))->count();
        $totalStudents = User::whereHas('userType', fn ($query) => $query->whereIn('name', ['étudiant', 'etudiant', 'student']))->count();
        $newUsers = User::where('created_at', '>=', now()->subDays(30))->count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCourses' => $totalCourses,
                'activeUsers' => $activeUsers,
                'newUsers' => $newUsers,
                'totalProfessors' => $totalProfessors,
                'totalStudents' => $totalStudents,
                'activationRate' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 1) : 0,
            ],
            'charts' => [
                'registrationsByMonth' => $this->buildRegistrationsByMonth(),
                'usersByRole' => $this->buildUsersByRole(),
                'usersByStatus' => $this->buildUsersByStatus(),
                'topCourses' => $this->buildTopCourses(),
            ],
            'highlights' => [
                'emptyCoursesCount' => Course::doesntHave('users')->count(),
                'unassignedProfessorsCount' => User::whereHas('userType', fn ($query) => $query->whereIn('name', ['professeur', 'teacher']))
                    ->doesntHave('courses')
                    ->count(),
                'unassignedStudentsCount' => User::whereHas('userType', fn ($query) => $query->whereIn('name', ['étudiant', 'etudiant', 'student']))
                    ->doesntHave('courses')
                    ->count(),
            ],
            'recentUsers' => User::with(['userType', 'status'])
                ->latest()
                ->take(6)
                ->get(),
        ]);
    }

    private function buildRegistrationsByMonth(): array
    {
        $startMonth = now()->startOfMonth()->subMonths(5);

        $registrations = User::query()
            ->where('created_at', '>=', $startMonth)
            ->get(['created_at'])
            ->groupBy(fn (User $user) => $user->created_at?->format('Y-m'));

        return collect(range(0, 5))
            ->map(function (int $offset) use ($startMonth, $registrations): array {
                $month = $startMonth->copy()->addMonths($offset);
                $key = $month->format('Y-m');

                return [
                    'label' => $month->translatedFormat('M Y'),
                    'value' => $registrations->has($key) ? $registrations->get($key)->count() : 0,
                ];
            })
            ->all();
    }

    private function buildUsersByRole(): array
    {
        $roleCounts = User::query()
            ->join('user_type', 'user_type.id', '=', 'users.id_1')
            ->selectRaw('LOWER(user_type.name) as role_name, COUNT(users.id) as total')
            ->groupBy('role_name')
            ->pluck('total', 'role_name');

        return [
            ['label' => 'Admins', 'value' => (int) ($roleCounts['admin'] ?? 0)],
            ['label' => 'Professeurs', 'value' => (int) ($roleCounts['professeur'] ?? 0) + (int) ($roleCounts['teacher'] ?? 0)],
            ['label' => 'Étudiants', 'value' => (int) ($roleCounts['étudiant'] ?? 0) + (int) ($roleCounts['etudiant'] ?? 0) + (int) ($roleCounts['student'] ?? 0)],
        ];
    }

    private function buildUsersByStatus(): array
    {
        return User::query()
            ->leftJoin('status', 'status.id', '=', 'users.id_2')
            ->selectRaw('COALESCE(status.name, "Inconnu") as label, COUNT(users.id) as value')
            ->groupBy('label')
            ->orderByDesc('value')
            ->get()
            ->map(fn ($row) => [
                'label' => (string) $row->label,
                'value' => (int) $row->value,
            ])
            ->all();
    }

    private function buildTopCourses(): array
    {
        return Course::query()
            ->withCount('users')
            ->orderByDesc('users_count')
            ->orderBy('name')
            ->take(5)
            ->get()
            ->map(fn (Course $course) => [
                'label' => $course->name,
                'value' => (int) $course->users_count,
            ])
            ->all();
    }
}