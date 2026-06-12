<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Display a listing of the clients.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Client/Index', [
            'clients' => Client::latest()->paginate(10)->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new client.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Client/Create');
    }

    /**
     * Store a newly created client in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('clients')],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        Client::create($validated);

        return redirect()->route('admin.clients.index')->with('success', 'Client créé avec succès.');
    }

    /**
     * Display the specified client.
     */
    public function show(Client $client): Response
    {
        return Inertia::render('Admin/Client/Show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified client.
     */
    public function edit(Client $client): Response
    {
        return Inertia::render('Admin/Client/Edit', [
            'client' => $client,
        ]);
    }

    /**
     * Update the specified client in storage.
     */
    public function update(Request $request, Client $client): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('clients')->ignore($client->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $client->update($validated);

        return redirect()->route('admin.clients.index')->with('success', 'Client modifié avec succès.');
    }

    /**
     * Remove the specified client from storage.
     */
    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return redirect()->route('admin.clients.index')->with('success', 'Client supprimé avec succès.');
    }
}
