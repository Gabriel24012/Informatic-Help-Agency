import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CartService } from '../../core/services/cart/cart.service';
import { Cart } from '../../core/types/Cart';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

// const BACKEND_URL = 'http://localhost:3000';
const BACKEND_URL = `${environment.BACK_URL}`;



@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, AsyncPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cart$: Observable<Cart | null>;
  cartTotal = 0;
  private sub = new Subscription();

  constructor(private cartService: CartService, private router: Router) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.sub.add(
      this.cart$.subscribe(cart => {
        if (cart && cart.products) {
          this.cartTotal = cart.products.reduce((sum, item) => {
            const price = item.product?.price ?? 0;
            const qty = item.quantity ?? 0;
            return sum + price * qty;
          }, 0);
        } else {
          this.cartTotal = 0;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // Construye la URL correcta para la imagen (soporta: full URL, relative "uploads/xxx", or filename)
  getImageUrl(product: any): string | null {
    if (!product) return null;
    const img = Array.isArray(product.imageURL) ? product.imageURL[0] : product.imageURL;
    if (!img) return null;

    // ya es URL completa
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }

    // ya incluye uploads/...
    if (typeof img === 'string' && img.startsWith('uploads')) {
      return `${BACKEND_URL}/${img}`;
    }

    // si solo es nombre de archivo como "k30.jpg"
    if (typeof img === 'string') {
      return `${BACKEND_URL}/uploads/${img}`;
    }

    return null;
  }

  // incrementar cantidad -> reutiliza addToCart (incrementa 1)
  increaseQuantity(item: any) {
    if (!item?.product?._id) return;
    this.cartService.addToCart(item.product._id, 1).subscribe();
  }

  // disminuir: queremos establecer cantidad - 1 (si queda 0, remover)
  decreaseQuantity(item: any) {
    if (!item?.product?._id) return;
    const newQty = item.quantity - 1;
    if (newQty <= 0) {
      this.removeItem(item);
      return;
    }
    this.cartService.setProductQuantity(item.product._id, newQty).subscribe();
  }

  removeItem(item: any) {
    if (!item?.product?._id) return;
    this.cartService.removeProductFromCart(item.product._id).subscribe();
  }

  emptyCart() {
    this.cartService.emptyCart().subscribe();
  }

  viewProductDetail(id: string) {
    this.router.navigate(['/product-detail', id]);
  }
}
