<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Client;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalProducts = Product::count();
        $totalClients = Client::count();
        $totalRevenue = Product::sum('price');
        $totalSales = Product::where('stock_quantity', '>', 0)->count();

        $recentProducts = Product::latest()->take(5)->get(['id', 'name', 'price', 'created_at']);
        $recentClients = Client::latest()->take(5)->get(['id', 'first_name', 'last_name', 'created_at']);

        $activities = collect();

        foreach ($recentProducts as $product) {
            $activities->push([
                'type' => 'product',
                'message' => "Produit « {$product->name} » ajouté",
                'date' => $product->created_at,
            ]);
        }

        foreach ($recentClients as $client) {
            $activities->push([
                'type' => 'client',
                'message' => "Client « {$client->first_name} {$client->last_name} » ajouté",
                'date' => $client->created_at,
            ]);
        }

        $recentActivities = $activities->sortByDesc('date')->take(10)->values();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalClients' => $totalClients,
                'totalRevenue' => number_format($totalRevenue, 2, ',', ' ') . ' €',
                'totalSales' => $totalSales,
            ],
            'recentActivities' => $recentActivities,
        ]);
    }
}
