// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { catchError, map, Observable, throwError, } from 'rxjs';
// import { Product, ProductResponse } from '../../types/Products';

// export type filters = {
//   q: string;
//   minPrice?: number | undefined;
//   maxPrice?: number | undefined;
// };

// @Injectable({
//   providedIn: 'root',
// })
// export class ProductsService {
//   private baseUrl = 'http://localhost:3000/api/products';
//   constructor(private httpClient: HttpClient) { }

//   getProducts(page: number = 1, limit: number = 10) {
//     return this.httpClient.get<ProductResponse>(this.baseUrl, { params: { page, limit } })
//       .pipe(
//         map(res => {
//           // Si tu imageURL es relativo, concatenar base URL
//           res.products.forEach(p => {
//             if (p.imageURL && !p.imageURL.startsWith('http')) {
//               p.imageURL = `http://localhost:3000${p.imageURL}`;
//             }
//           });
//           return res;
//         })
//       );
//   }

//   getProductByID(id: string): Observable<Product> {
//     return this.httpClient.get<Product>(`${this.baseUrl}/${id}`);
//   }

//   searchProducts(searchConfig: filters): Observable<Product[]> {
//     let filters: filters = {
//       q: searchConfig.q
//     }
//     if (searchConfig.minPrice) {
//       filters.minPrice = searchConfig.minPrice;
//     }
//     if (searchConfig.maxPrice) {
//       filters.maxPrice = searchConfig.maxPrice;
//     }
//     const params = new HttpParams({ fromObject: filters });
//     return this.httpClient.get<ProductResponse>(`${this.baseUrl}/search`, { params }).pipe(
//       map(response => {
//         return response.products;
//       })
//     )

//   }
// }
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Product, ProductResponse } from '../../types/Products';
import { environment } from '../../../../environments/environment';

export type filters = {
  q: string;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
};

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  // private baseUrl = 'http://localhost:3000/api/products';
  private baseUrl = `${environment.BACK_URL}/api/products`;


  constructor(private httpClient: HttpClient) { }

  // Helper para normalizar imageURL siempre como array
  private normalizeImageURL(product: Product): Product {
    if (!product.imageURL) {
      product.imageURL = [];
    } else if (!Array.isArray(product.imageURL)) {
      product.imageURL = [product.imageURL];
    }

    // Si alguna URL es relativa, concatenar base URL
    product.imageURL = product.imageURL.map(url =>
      // url.startsWith('http') ? url : `http://localhost:3000${url}`
      url.startsWith('http') ? url : `${environment.BACK_URL}${url}`

    );

    return product;
  }

getProducts(page: number = 1, limit: number = 10): Observable < ProductResponse > {
  return this.httpClient.get<ProductResponse>(this.baseUrl, { params: { page, limit } }).pipe(
    map(res => {
      res.products = res.products.map(p => this.normalizeImageURL(p));
      return res;
    })
  );
}

getProductByID(id: string): Observable < Product > {
  return this.httpClient.get<Product>(`${this.baseUrl}/${id}`).pipe(
    map(p => this.normalizeImageURL(p))
  );
}

searchProducts(searchConfig: filters): Observable < Product[] > {
  let paramsObj: filters = { q: searchConfig.q };
  if(searchConfig.minPrice) paramsObj.minPrice = searchConfig.minPrice;
  if(searchConfig.maxPrice) paramsObj.maxPrice = searchConfig.maxPrice;

  const params = new HttpParams({ fromObject: paramsObj });

  return this.httpClient.get<ProductResponse>(`${this.baseUrl}/search`, { params }).pipe(
    map(response => response.products.map(p => this.normalizeImageURL(p)))
  );
}

getProductsByCategory(categoryId: string, page: number = 1, limit: number = 10): Observable < ProductResponse > {
  return this.httpClient.get<ProductResponse>(`${this.baseUrl}/category/${categoryId}`, { params: { page, limit } })
    .pipe(
      map(res => {
        res.products = res.products.map(p => this.normalizeImageURL(p));
        return res;
      })
    );
}


}
