<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $legacyPaths = DB::table('lesson_files')
            ->where('file_path', 'like', '/lessons/data/%')
            ->pluck('file_path')
            ->merge(
                DB::table('lessons')
                    ->where('file_path', 'like', '/lessons/data/%')
                    ->pluck('file_path')
            )
            ->filter()
            ->unique();

        Storage::disk('public')->makeDirectory('lessons/data');

        foreach ($legacyPaths as $legacyPath) {
            $fileName = basename($legacyPath);
            $relativeStoragePath = 'lessons/data/' . $fileName;
            $sourcePath = public_path(ltrim($legacyPath, '/'));
            $destinationPath = Storage::disk('public')->path($relativeStoragePath);

            if (File::isFile($sourcePath) && ! File::exists($destinationPath)) {
                File::move($sourcePath, $destinationPath);
            }

            if (File::isFile($destinationPath)) {
                $storagePath = '/storage/' . $relativeStoragePath;

                DB::table('lesson_files')
                    ->where('file_path', $legacyPath)
                    ->update(['file_path' => $storagePath]);

                DB::table('lessons')
                    ->where('file_path', $legacyPath)
                    ->update(['file_path' => $storagePath]);
            }
        }
    }

    public function down(): void
    {
        $storagePaths = DB::table('lesson_files')
            ->where('file_path', 'like', '/storage/lessons/data/%')
            ->pluck('file_path')
            ->merge(
                DB::table('lessons')
                    ->where('file_path', 'like', '/storage/lessons/data/%')
                    ->pluck('file_path')
            )
            ->filter()
            ->unique();

        File::ensureDirectoryExists(public_path('lessons/data'));

        foreach ($storagePaths as $storagePath) {
            $fileName = basename($storagePath);
            $relativeStoragePath = 'lessons/data/' . $fileName;
            $sourcePath = Storage::disk('public')->path($relativeStoragePath);
            $legacyPath = '/lessons/data/' . $fileName;
            $destinationPath = public_path(ltrim($legacyPath, '/'));

            if (File::isFile($sourcePath) && ! File::exists($destinationPath)) {
                File::move($sourcePath, $destinationPath);
            }

            if (File::isFile($destinationPath)) {
                DB::table('lesson_files')
                    ->where('file_path', $storagePath)
                    ->update(['file_path' => $legacyPath]);

                DB::table('lessons')
                    ->where('file_path', $storagePath)
                    ->update(['file_path' => $legacyPath]);
            }
        }
    }
};
