import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../core/services/pokemon.service';
import { PokemonDetail, PokemonListItem, PokemonListResponse } from '../../core/models/pokemon.model';

interface PokemonCard {
  id: number;
  name: string;
  sprite: string;
}

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <header class="hero">
        <div>
          <p class="eyebrow">Pokédex</p>
          <h1>Explora el catálogo</h1>
          <p class="muted">
            Desliza horizontalmente para ver más Pokémones. Usa la búsqueda para filtrar por nombre
            y pulsa "Cargar más" cuando quieras extender la lista. Ahorita estas viendo los mas
            populares.
          </p>
          <div class="controls">
            <input
              type="search"
              [(ngModel)]="searchTerm"
              placeholder="Buscar por nombre"
              class="search"
            />
            <button (click)="loadMore()" [disabled]="loading()">Cargar más</button>
          </div>
          <p *ngIf="error()" class="error">{{ error() }}</p>
        </div>
        <div class="badge">+{{ pokemons().length }} vistos</div>
      </header>

      <div class="scroll-zone">
        <div class="scroll-row" *ngIf="filtered().length; else emptyState">
          <article *ngFor="let pokemon of filtered()" class="card" (click)="openDetail(pokemon)">
            <div class="tag">#{{ pokemon.id | number: '3.0' }}</div>
            <img [src]="pokemon.sprite" [alt]="pokemon.name" loading="lazy" />
            <h3>{{ pokemon.name | titlecase }}</h3>
          </article>
        </div>
        <ng-template #emptyState>
          <div class="empty">No hay resultados con ese filtro</div>
        </ng-template>
      </div>

      <aside class="detail" *ngIf="selected()">
        <header class="detail-head">
          <div>
            <p class="eyebrow">Detalle del Pokémon</p>
            <h2>{{ selected()?.name | titlecase }}</h2>
            <p class="muted">Altura {{ selected()?.height }} | Peso {{ selected()?.weight }}</p>
          </div>
          <button class="ghost" type="button" (click)="selected.set(null)">Cerrar</button>
        </header>
        <div class="detail-body" *ngIf="!detailLoading(); else loadingDetail">
          <img [src]="selected()?.sprites?.front_default || ''" [alt]="selected()?.name || ''" />
          <div class="stats">
            <div *ngFor="let stat of selected()?.stats">
              <span>{{ stat.stat.name | titlecase }}</span>
              <strong>{{ stat.base_stat }}</strong>
            </div>
          </div>
          <div class="types">
            <span class="chip" *ngFor="let t of selected()?.types">{{ t.type.name | titlecase }}</span>
          </div>
        </div>
        <ng-template #loadingDetail>
          <p class="muted">Cargando detalle...</p>
        </ng-template>
      </aside>
    </section>
  `,
  styleUrls: ['./pokedex.component.scss']
})
export class PokedexComponent implements OnInit {
  pokemons = signal<PokemonCard[]>([]);
  loading = signal(false);
  error = signal('');
  offset = signal(0);
  readonly limit = 18;
  selected = signal<PokemonDetail | null>(null);
  detailLoading = signal(false);

  searchTerm = '';
  filtered = computed(() =>
    this.pokemons().filter((p) => p.name.toLowerCase().includes(this.searchTerm.trim().toLowerCase()))
  );

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.loadMore();
  }

  loadMore(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.pokemonService.list(this.limit, this.offset()).subscribe({
      next: (res) => {
        const mapped = this.mapResponse(res);
        this.pokemons.update((current) => [...current, ...mapped]);
        this.offset.update((val) => val + this.limit);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No pudimos cargar los Pokémon.');
      },
      complete: () => this.loading.set(false)
    });
  }

  private mapResponse(res: PokemonListResponse): PokemonCard[] {
    return res.results.map((item) => {
      const id = this.extractId(item);
      return {
        id,
        name: item.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
      };
    });
  }

  private extractId(item: PokemonListItem): number {
    const segments = item.url.split('/').filter(Boolean);
    const idStr = segments[segments.length - 1];
    return Number(idStr);
  }

  openDetail(pokemon: PokemonCard): void {
    this.detailLoading.set(true);
    this.selected.set(null);
    this.pokemonService.detail(pokemon.name).subscribe({
      next: (detail) => this.selected.set(detail),
      error: () => this.error.set('No pudimos cargar el detalle.'),
      complete: () => this.detailLoading.set(false)
    });
  }
}
