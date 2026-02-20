import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <header class="hero">
        <div>
          <h1>Tu perfil</h1>
          <p class="muted">Actualiza tus datos básicos y dinos qué géneros de películas te gustan.</p>
        </div>
        <div class="pill success" *ngIf="saved()">Cambios guardados</div>
      </header>

      <form class="profile-form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid">
          <label class="field">
            <span>Nombre</span>
            <input type="text" formControlName="name" placeholder="Tu nickname" />
          </label>
          <label class="field">
            <span>Email</span>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com" />
          </label>
        </div>

        <div class="genres">
          <span class="label">Géneros favoritos</span>
          <div class="chips">
            <button
              type="button"
              class="chip"
              [class.selected]="isSelected(option)"
              *ngFor="let option of genreOptions"
              (click)="toggleGenre(option)"
            >
              {{ option }}
            </button>
          </div>

          <div class="inline">
            <input
              type="text"
              formControlName="newGenre"
              placeholder="Añadir género personalizado y presiona Enter"
              (keydown.enter)="addCustomGenre($event)"
            />
            <button type="button" (click)="addCustomGenre($event)">Agregar</button>
          </div>

          <div class="selected" *ngIf="selectedGenres().length">
            <p class="muted">Seleccionados: {{ selectedGenres().join(', ') }}</p>
          </div>
        </div>

        <div class="actions">
          <button type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <span class="error" *ngIf="error()">{{ error() }}</span>
        </div>
      </form>
    </section>
  `,
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  loading = signal(false);
  error = signal('');
  saved = signal(false);
  selectedGenres = signal<string[]>([]);

  genreOptions = ['Acción', 'Comedia', 'Drama', 'Sci-Fi', 'Terror', 'Romance', 'Documental', 'Animación'];

  form!: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    newGenre: FormControl<string>;
  }>;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.nonNullable.group({
      name: this.fb.nonNullable.control('', [Validators.required]),
      email: this.fb.nonNullable.control('', [Validators.email]),
      newGenre: this.fb.nonNullable.control('')
    });
  }

  ngOnInit(): void {
    const current = this.auth.currentUser;
    if (current) {
      this.fillForm(current);
    } else {
      this.auth.fetchMe().subscribe({
        next: (user) => this.fillForm(user),
        error: () => this.error.set('No pudimos cargar tu información')
      });
    }
  }

  toggleGenre(option: string): void {
    this.selectedGenres.update((list) =>
      list.includes(option) ? list.filter((g) => g !== option) : [...list, option]
    );
  }

  isSelected(option: string): boolean {
    return this.selectedGenres().includes(option);
  }

  addCustomGenre(event: Event): void {
    event.preventDefault();
    const value = this.form.controls.newGenre.value?.trim();
    if (!value) return;
    if (!this.selectedGenres().includes(value)) {
      this.selectedGenres.update((list) => [...list, value]);
    }
    this.form.controls.newGenre.reset();
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set('');
    this.saved.set(false);

    const payload = {
      name: this.form.controls.name.value?.trim(),
      email: this.form.controls.email.value?.trim() || null,
      favorite_genres: this.selectedGenres()
    };

    this.auth.updateProfile(payload).subscribe({
      next: (user) => {
        this.saved.set(true);
        this.fillForm(user);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No pudimos actualizar el perfil.');
      },
      complete: () => this.loading.set(false)
    });
  }

  private fillForm(user: User): void {
    this.form.patchValue({
      name: user.name,
      email: user.email || ''
    });
    this.selectedGenres.set(user.favorite_genres || []);
  }
}
