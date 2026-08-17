<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LessonMediaController extends Controller
{
    public function show(Request $request): BinaryFileResponse
    {
        $validated = $request->validate([
            'path' => ['required', 'string'],
        ]);

        $relativePath = '/' . ltrim($validated['path'], '/');
        abort_unless(
            str_starts_with($relativePath, '/lessons/data/') || str_starts_with($relativePath, '/storage/'),
            404
        );

        $absolutePath = public_path(ltrim($relativePath, '/'));
        $realPath = realpath($absolutePath);
        abort_unless($realPath !== false && File::isFile($realPath), 404);

        $allowedRoots = array_filter([
            realpath(public_path('lessons/data')),
            realpath(public_path('storage')),
        ]);

        $isAllowed = collect($allowedRoots)->contains(fn (string $root) => str_starts_with($realPath, $root));
        abort_unless($isAllowed, 404);

        return response()->file($realPath, [
            'Content-Type' => File::mimeType($realPath) ?: 'application/octet-stream',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
