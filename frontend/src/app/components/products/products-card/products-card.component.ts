import { Component, Input } from '@angular/core';
import { Product } from '../../../core/types/Products';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminDirective } from '../../../core/directives/admin.directive';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../../../core/services/cart/cart.service';

@Component({
  selector: 'app-products-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './products-card.component.html',
  styleUrl: './products-card.component.css'
})
export class ProductsCardComponent {
  @Input() product!: Product;
  constructor(private cartService: CartService) { }
  loading: boolean = false;


  addToCart() {
    if (!this.product?._id) {
      console.error('Product ID no definido');
      return;
    }

    this.loading = true;
    this.cartService.addToCart(this.product._id).subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.loading = false;
        console.error('Error al agregar producto al carrito:', err);
      },
    });
  }
}
