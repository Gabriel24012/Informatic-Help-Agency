import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SearchProductsComponent } from "../products/search-products/search-products.component";
import { AuthService } from '../../core/services/auth/auth.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { AdminDirective } from "../../core/directives/admin.directive";
import { CartService } from '../../core/services/cart/cart.service';
import { Observable } from 'rxjs';
import { CategoryService } from '../../core/services/category/category.service';
import { Category } from '../../core/types/Category';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchProductsComponent, AdminDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeaderComponent implements OnInit {
  auth = inject(AuthService);
  toast = inject(ToastService);
  cartItemCount$!: Observable<number>;
  parentCategories$!: Observable<Category[]>;


  categoriesOpen = false;
  servicesOpen = false;
  userMenuOpen = false;
  isMobileOpen = false;
  guestMenuOpen = false;

  private guestTimeout?: any;
  private categoriesTimeout?: any;
  private servicesTimeout?: any;
  private userTimeout?: any;
  private router = inject(Router);




  constructor(private cartService: CartService, private categoryService: CategoryService) { }


  ngOnInit(): void {
    this.cartItemCount$ = this.cartService.cartItemCount;

    this.parentCategories$ = this.categoryService.parentCategories$;
    // carga inicial (normaliza respuesta y llena el BehaviorSubject)
    this.categoryService.loadCategories().subscribe({
      next: (list) => console.log('Categorías cargadas:', list),
      error: (e) => console.error('loadCategories error', e)
    });
  }


  toggleMobile() { this.isMobileOpen = !this.isMobileOpen; }

  openCategories() { clearTimeout(this.categoriesTimeout); this.categoriesOpen = true; }
  closeCategories() { this.categoriesTimeout = setTimeout(() => this.categoriesOpen = false, 150); }

  openServices() { clearTimeout(this.servicesTimeout); this.servicesOpen = true; }
  closeServices() { this.servicesTimeout = setTimeout(() => this.servicesOpen = false, 150); }

  openUserMenu() {
    clearTimeout(this.userTimeout);
    this.userMenuOpen = true;
  }
  closeUserMenu() {
    this.userTimeout = setTimeout(() => this.userMenuOpen = false, 150);
  }

  openGuestMenu() {
    clearTimeout(this.guestTimeout);
    this.guestMenuOpen = true;
  }

  closeGuestMenu() {
    this.guestTimeout = setTimeout(() => this.guestMenuOpen = false, 150);
  }

  isLoggedIn(): boolean {
    return !!this.auth.token;
  }

  get displayName(): string | null {
    return this.auth.decodedToken?.displayName ?? null;
  }

  onLogout() {
    this.auth.logout('/');
    setTimeout(() => location.reload(), 300);
  }

  onLoginSuccess(displayName: string) {
    this.toast.success(`¡Bienvenido ${displayName}!`, 2500);
    // Forzar actualización si es necesario
    setTimeout(() => location.reload(), 300);
  }

  selectedCategoryId: string = '';

  selectCategory(categoryId: string) {
  this.selectedCategoryId = categoryId;
  this.router.navigate(['/products-list'], { queryParams: { category: categoryId || null } });
}



}
