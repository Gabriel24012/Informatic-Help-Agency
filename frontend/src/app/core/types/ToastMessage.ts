export type ToastMessage = {
  id: number;
  text: string;
  type: 'success' | 'error';
  duration?: number;
};
