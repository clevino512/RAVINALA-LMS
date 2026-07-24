<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->must_change_password) {
            return redirect()->route('profile.edit')
                ->with('status', 'Vous devez modifier votre mot de passe avant de continuer.');
        }

        return $next($request);
    }
}
