<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class PokemonController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->query('limit', 20);
        $offset = (int) $request->query('offset', 0);

        $cacheKey = "pokeapi:list:{$limit}:{$offset}";

        $data = Cache::remember($cacheKey, 60, function () use ($limit, $offset) {
            $response = Http::get('https://pokeapi.co/api/v2/pokemon', [
                'limit' => $limit,
                'offset' => $offset,
            ]);

            if ($response->failed()) {
                abort(Response::HTTP_BAD_GATEWAY, 'No se pudo obtener la lista de Pokémon');
            }

            return $response->json();
        });

        return response()->json($data);
    }

    public function show(string $name)
    {
        $cacheKey = "pokeapi:detail:{$name}";

        $data = Cache::remember($cacheKey, 60, function () use ($name) {
            $response = Http::get("https://pokeapi.co/api/v2/pokemon/{$name}");

            if ($response->failed()) {
                abort(Response::HTTP_NOT_FOUND, 'Pokémon no encontrado');
            }

            return $response->json();
        });

        return response()->json($data);
    }
}
