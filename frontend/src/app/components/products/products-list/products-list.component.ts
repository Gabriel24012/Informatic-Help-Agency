import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ProductResponse } from '../../../core/types/Products';
import { ProductsCardComponent } from "../products-card/products-card.component";
import { ProductsService } from '../../../core/services/products/products.service';
import { PlaceholderComponent } from "../../shared/placeholder/placeholder/placeholder.component";
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [ProductsCardComponent, PlaceholderComponent, MatPaginatorModule],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit, OnChanges {
  @Input() categoryId?: string; // recibe la categoría desde el padre



  productResponse: ProductResponse = {
    products: [],
    pagination: { currentPage: 1, totalPages: 1, totalResults: 0, hasNext: false, hasPrev: false }
  };


  constructor(private productsService: ProductsService) { }



  ngOnInit(): void {
    this.getProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Si cambia la categoría, recargamos productos
    if (changes['categoryId']) {
      this.getProducts();
    }
  }

  getProducts(page: number = 1, limit: number = 16) {
    if (this.categoryId && this.categoryId !== '') {
      this.productsService.getProductsByCategory(this.categoryId, page, limit).subscribe({
        next: (data) => {
          this.productResponse = data;
        },
        error: (error) => {
          console.error(error);
        }
      });
    } else {
      this.productsService.getProducts(page, limit).subscribe({
        next: (data) => {
          this.productResponse = data;
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  onPageChange(event: PageEvent) {
    this.getProducts(event.pageIndex + 1, event.pageSize); // MatPaginator empieza en 0
  }

  get skeletonArray(): number[] {
    const expectedCount = this.productResponse?.products?.length || 8;
    return Array(expectedCount).fill(0);
  }

  retryLoadProducts(): void {
    this.getProducts();
  }
}
