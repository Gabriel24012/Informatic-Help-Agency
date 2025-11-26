import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '../../../core/services/toast/toast.service';
import { Observable, of, scan, Subscription, takeUntil } from 'rxjs';
import { ToastMessage } from '../../../core/types/ToastMessage';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-toast',
  imports: [AsyncPipe, NgClass],
  // imports: [CommonModule],
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnInit {

  toasts$: Observable<ToastMessage[]> = of([]);
  toastHistory$: Observable<ToastMessage[]> = of([]);
  showHistory = false; 

  constructor(private toast: ToastService) {}
  ngOnInit(): void {
    this.toasts$ = this.toast.toast$;
    
    this.toastHistory$ = this.toast.toastHistory$.pipe(
      scan((acc: ToastMessage[], current: ToastMessage) => {
        const updated = [...acc, current];
        return updated.slice(-10);
      }, [])
    );
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }
}
