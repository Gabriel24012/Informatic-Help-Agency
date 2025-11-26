import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../core/services/products/products.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../core/types/Products';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-products-detail',
  imports: [CurrencyPipe],
  templateUrl: './products-detail.component.html',
  styleUrl: './products-detail.component.css'
})
export class ProductsDetailComponent implements OnInit {
  product: Product | null = null;

  constructor(private productService: ProductsService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        console.log(params)
        const id = params.get('id');
        if (!id) {
          return
        }
        this.productService.getProductByID(id).subscribe({
          next: (product) => {
            this.product = product;
            console.log(product)
          },
          error: (error) => {
            this.product = null;
          }
        });
      }
    })
    // this.productService.getProductByID();
  }

}
