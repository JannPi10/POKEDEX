<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'nickname' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('name', $validated['nickname'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], Response::HTTP_UNAUTHORIZED);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $user->tokens()->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }
}
