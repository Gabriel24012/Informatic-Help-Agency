import { Component } from '@angular/core';
import { CarouselComponent } from "../../components/carrusel/carrusel.component";
import { CarrouselProductsComponent } from "../../components/carrousel-products/carrousel-products.component";
import { AdminDirective } from "../../core/directives/admin.directive";

@Component({
  selector: 'app-home',
  imports: [CarouselComponent, CarrouselProductsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  indicators: boolean = false;
  autoPlay: boolean = true;
}
