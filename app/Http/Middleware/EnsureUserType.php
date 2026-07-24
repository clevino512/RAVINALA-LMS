<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserType
{
    public function handle(Request $request, Closure $next, string ...$types): Response
    {
        $user = $request->user();

        abort_unless(
            $user && collect($types)->contains(fn (string $type) => $user->hasUserType($type)),
            Response::HTTP_FORBIDDEN,
            'Accès interdit pour ce type d’utilisateur.'
        );

        return $next($request);
    }
}
