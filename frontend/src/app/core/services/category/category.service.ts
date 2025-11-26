import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Category } from '../../types/Category';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  // private apiUrl = 'http://localhost:3000/api/categories';
  private apiUrl = `${environment.BACK_URL}/api/categories`;

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  // observable derivado que solo expone categorías raíz (sin parent)
  parentCategories$: Observable<Category[]> = this.categories$.pipe(
    map(cats =>
      cats.filter(cat => {
        if (cat.parentCategory == null) return true; // null o undefined
        if (typeof cat.parentCategory === 'string') return cat.parentCategory.trim() === '';
        // si viene como objeto poblado => tiene parent => no es raíz
        return false;
      })
    )
  );

  constructor(private http: HttpClient) { }

  loadCategories(): Observable<Category[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => Array.isArray(res) ? res : (res.categories ?? [])),
      tap(list => this.categoriesSubject.next(list)),
      catchError(err => {
        console.error('Error cargando categorías', err);
        this.categoriesSubject.next([]);
        return of([]);
      })
    );
  }

  refreshCategories(): void {
    this.loadCategories().subscribe({ next: () => { }, error: err => console.error(err) });
  }
}
