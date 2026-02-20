<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'favorite_genres' => 'sometimes|array',
            'favorite_genres.*' => 'string',
        ]);

        if (array_key_exists('favorite_genres', $validated)) {
            $validated['favorite_genres'] = array_values($validated['favorite_genres']);
        }

        $user->update($validated);

        return response()->json($user, Response::HTTP_OK);
    }
}
