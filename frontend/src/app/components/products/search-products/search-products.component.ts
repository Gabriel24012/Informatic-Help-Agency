import { Component, Input, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../core/services/products/products.service';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { Product } from '../../../core/types/Products';
import { Router } from '@angular/router'; // IMPORTANTE

@Component({
  selector: 'app-search-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-products.component.html'
})
export class SearchProductsComponent implements OnInit {
  @Input() mode: 'header' | 'completo' = 'completo';

  showResults = false;
  products: Product[] = [];

  searchProductForm = new FormGroup({
    q: new FormControl('', { nonNullable: true })
  });

  constructor(private productService: ProductsService, private elementRef: ElementRef, private router: Router) { }

  ngOnInit(): void {
    this.searchProductForm.get('q')!.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => {
        const query = (q || '').trim();
        if (!query) {
          this.showResults = false;
          return of<Product[]>([]);
        }
        this.showResults = true;
        return this.productService.searchProducts({ q: query });
      })
    ).subscribe(products => {
      this.products = products;
    });
  }

  // Click fuera para ocultar resultados
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showResults = false;
    }
  }

  // FUNCION PARA REDIRIGIR AL DETALLE
  goToProductDetail(productId: string) {
    // Ajusta la ruta según tu página de detalle
    this.router.navigate(['/product-detail', productId]);
    this.showResults = false; // opcional: oculta dropdown al ir al detalle
  }
}
