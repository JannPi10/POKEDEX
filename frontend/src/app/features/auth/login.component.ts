import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="auth-shell">
      <div class="auth-card">
        <p class="eyebrow">Bienvenido</p>
        <h1>Pokédex IPT</h1>
        <p class="muted">Ingresa con el usuario de prueba.</p>

        <form class="auth-form" [formGroup]="form" (ngSubmit)="onSubmit()">
          <label class="field">
            <span>Nickname</span>
            <input
              type="text"
              formControlName="nickname"
              placeholder="iptdevs"
              autocomplete="username"
            />
          </label>

          <label class="field">
            <span>Contraseña</span>
            <input
              type="password"
              formControlName="password"
              placeholder="123456"
              autocomplete="current-password"
            />
          </label>

          <button class="primary" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Ingresando...' : 'Entrar' }}
          </button>

          <p class="hint">Usuario demo: <strong>iptdevs / 123456</strong></p>
          <p *ngIf="error()" class="error">{{ error() }}</p>
        </form>
      </div>
    </section>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = signal(false);
  error = signal('');

  form!: FormGroup<{
    nickname: FormControl<string>;
    password: FormControl<string>;
  }>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      nickname: this.fb.nonNullable.control('iptdevs', [Validators.required]),
      password: this.fb.nonNullable.control('123456', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.error.set('');
    this.loading.set(true);

    const credentials = this.form.getRawValue();

    this.auth.login(credentials).subscribe({
      next: (res) => {
        if ((res as any)?.token) {
          this.router.navigate(['/pokedex']);
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'No pudimos iniciar sesión';
        this.error.set(message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
