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
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalUsers' => User::count(),
                'totalCourses' => Course::count(),
                'activeUsers' => User::whereHas('status', fn ($query) => $query->where('name', 'actif'))->count(),
                'newUsers' => User::where('created_at', '>=', now()->subDays(30))->count(),
            ],
            'recentUsers' => User::with(['userType', 'status'])
                ->latest()
                ->take(6)
                ->get(),
        ]);
    }
}
