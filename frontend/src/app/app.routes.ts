import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { LoginComponent } from './features/auth/login.component';
import { PokedexComponent } from './features/pokedex/pokedex.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'pokedex', component: PokedexComponent, canActivate: [authGuard] },
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'pokedex' },
  { path: '**', redirectTo: 'pokedex' }
];
