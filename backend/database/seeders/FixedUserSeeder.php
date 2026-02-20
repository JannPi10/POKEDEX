<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class FixedUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'iptdevs@example.com'],
            [
                'name' => 'iptdevs',
                'password' => Hash::make('123456'),
                'favorite_genres' => [],
            ]
        );
    }
}
