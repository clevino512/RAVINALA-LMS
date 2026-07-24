<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $type = $request->string('type')->toString();
        $status = $request->string('status')->toString();
        $allowedPerPage = [5, 10, 15, 20, 25];
        $perPage = (int) $request->integer('per_page', 10);

        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $users = User::with(['userType', 'status', 'courses'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($type !== '', fn ($query) => $query->where('id_1', $type))
            ->when($status !== '', fn ($query) => $query->where('id_2', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'userTypes' => UserType::orderBy('name')->get(),
            'statuses' => Status::orderBy('name')->get(),
            'courses' => Course::orderBy('name')->get(),
            'filters' => [
                'search' => $search,
                'type' => $type,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $courseIds = $this->resolveCourseIds($validated);
        unset($validated['course_ids']);
        $validated['password'] = Hash::make($validated['password']);
        $validated['must_change_password'] = $this->requiresInitialPasswordChange($validated['id_1']);

        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture'] = $this->storeProfilePicture($request);
        }

        $user = User::create($validated);
        $user->courses()->sync($courseIds);

        return redirect()->route('admin.users.index')->with(
            'success',
            'Compte cree. Le mot de passe devra etre modifie a la premiere connexion.'
        );
    }

    public function show(User $user): Response
    {
        $user->load(['userType', 'status', 'courses']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate($this->rules($user));
        $courseIds = $this->resolveCourseIds($validated);
        unset($validated['course_ids']);

        if ($request->hasFile('profile_picture')) {
            $this->deleteStoredProfilePicture($user->profile_picture);
            $validated['profile_picture'] = $this->storeProfilePicture($request);
        } else {
            unset($validated['profile_picture']);
        }

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
            $validated['must_change_password'] = $this->requiresInitialPasswordChange($validated['id_1']);
        }

        $user->update($validated);
        $user->courses()->sync($courseIds);

        return redirect()->route('admin.users.index')->with('success', 'Compte modifie.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->is($user), 422, 'Vous ne pouvez pas supprimer votre propre compte.');

        $this->deleteStoredProfilePicture($user->profile_picture);
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Compte supprime.');
    }

    private function rules(?User $user = null): array
    {
        return [
            'first_name' => ['required', 'string', 'max:250'],
            'last_name' => ['nullable', 'string', 'max:250'],
            'email' => ['nullable', 'email', 'max:200', Rule::unique(User::class)->ignore($user?->id)],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'sex' => ['nullable', Rule::in(['homme', 'femme', 'autre'])],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'password' => [$user ? 'nullable' : 'required', 'confirmed', Password::defaults()],
            'id_1' => ['required', 'exists:user_type,id'],
            'id_2' => ['required', 'exists:status,id'],
            'course_ids' => ['nullable', 'array'],
            'course_ids.*' => ['integer', 'distinct', 'exists:courses,id'],
        ];
    }

    private function resolveCourseIds(array $validated): array
    {
        $userType = UserType::find($validated['id_1']);
        $isAdministrator = in_array(
            mb_strtolower((string) $userType?->name),
            ['admin', 'administrateur'],
            true,
        );

        if ($isAdministrator) {
            return Course::pluck('id')->all();
        }

        return $validated['course_ids'] ?? [];
    }

    private function requiresInitialPasswordChange(int|string $userTypeId): bool
    {
        $typeName = mb_strtolower((string) UserType::find($userTypeId)?->name);

        return in_array($typeName, ['étudiant', 'etudiant', 'student', 'professeur', 'teacher'], true);
    }

    private function storeProfilePicture(Request $request): string
    {
        $path = $request->file('profile_picture')->store('profile-pictures', 'public');

        return Storage::url($path);
    }

    private function deleteStoredProfilePicture(?string $storedPath): void
    {
        if (! $storedPath || ! str_starts_with($storedPath, '/storage/')) {
            return;
        }

        Storage::disk('public')->delete(str_replace('/storage/', '', $storedPath));
    }
}
