import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ProductsService } from '../../core/services/products/products.service';
import { Product, ProductResponse } from '../../core/types/Products';
import { ProductsCardComponent } from '../products/products-card/products-card.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-carrousel-products',
  imports: [CommonModule, ProductsCardComponent],
  templateUrl: './carrousel-products.component.html',
  styleUrls: ['./carrousel-products.component.css']
})
export class CarrouselProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  productos: Product[] = [];
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;
  private intervalId!: any;

  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.getProducts();
  }

  ngAfterViewInit(): void {
    this.autoScroll();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  // getProducts(page: number = 1, limit: number = 10) {
  //   this.productsService.getProducts(page, limit).subscribe({
  //     next: (data: ProductResponse) => {
  //       this.productos = data.products.map(p => ({
  //         ...p,
  //         imageURL: p.imageURL.startsWith('http') ? p.imageURL : `http://localhost:3000/${p.imageURL}`
  //       }));
  //     },
  //     error: (error) => console.error('Error cargando productos:', error)
  //   });
  // }
  getProducts(page: number = 1, limit: number = 10) {
    this.productsService.getProducts(page, limit).subscribe({
      next: (data: ProductResponse) => {
        this.productos = data.products.map(p => ({
          ...p,
          imageURL: (Array.isArray(p.imageURL) ? p.imageURL : [p.imageURL]).map(url =>
            // url.startsWith('http') ? url : `http://localhost:3000/${url}`
            url.startsWith('http') ? url : `${environment.BACK_URL}/${url}`

          )

        }));
      },
      error: (error) => console.error('Error cargando productos:', error)
    });
  }


  // Scroll botones
  scrollNext() {
    this.carousel.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollPrev() {
    this.carousel.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  autoScroll() {
    this.intervalId = setInterval(() => {
      if (!this.isDragging) this.scrollNext();
    }, 5000);
  }

  // Drag
  dragStart(event: MouseEvent | TouchEvent, isTouch = false) {
    this.isDragging = true;
    const x = isTouch
      ? (event as TouchEvent).touches[0].pageX - this.carousel.nativeElement.offsetLeft
      : (event as MouseEvent).pageX - this.carousel.nativeElement.offsetLeft;
    this.startX = x;
    this.scrollLeft = this.carousel.nativeElement.scrollLeft;
    this.carousel.nativeElement.classList.add('cursor-grabbing');
  }

  dragMove(event: MouseEvent | TouchEvent, isTouch = false) {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = isTouch
      ? (event as TouchEvent).touches[0].pageX - this.carousel.nativeElement.offsetLeft
      : (event as MouseEvent).pageX - this.carousel.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.carousel.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  dragEnd() {
    this.isDragging = false;
    this.carousel.nativeElement.classList.remove('cursor-grabbing');
  }
}
