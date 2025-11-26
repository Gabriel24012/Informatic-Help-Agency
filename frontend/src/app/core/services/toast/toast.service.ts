import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { ToastMessage } from '../../types/ToastMessage';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // Subject objeto que estamos observando, no requiere valor inicial
  // null
  // 1, 3, 6
  // BehaviorSubject objeto que observamos, requiere un valor inicial;

  //ReplaySubject historial de un objeto que objeto que observamos;

  private toastSubject: BehaviorSubject<ToastMessage[]> = new BehaviorSubject<
    ToastMessage[]
  >([]);

  readonly toast$ = this.toastSubject.asObservable();
  private toastHistorySubject: ReplaySubject<ToastMessage> =
    new ReplaySubject<ToastMessage>(10);

  toastHistory$ = this.toastHistorySubject.asObservable();

  private counter: number = 0;

  constructor() {}
  // [1,5,6,7,2] 5
  //[1,5,6,7,2, 5]

  private show(toastPartial: Omit<ToastMessage, 'id'>) {
    const id = ++this.counter;
    const newToast: ToastMessage = { ...toastPartial, id };
    const currentToasts = this.toastSubject.value;
    this.toastSubject.next([...currentToasts, newToast]);
    this.toastHistorySubject.next(newToast);

    setTimeout(() => {
      this.dissmiss(id);
    }, toastPartial.duration ?? 5000);
  }
  private dissmiss(id: number) {
    const update = this.toastSubject.value.filter((t) => t.id !== id);
    this.toastSubject.next(update);
  }

  success(text: string, duration = 5000) {
    this.show({ text, type: 'success', duration });
  }
  error(text: string, duration = 5000) {
    this.show({ text, type: 'error', duration });
  }
}
