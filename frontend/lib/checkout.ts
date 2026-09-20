import { api } from './api';
type PaymentResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global { interface Window { Razorpay: new (options: Record<string, unknown>) => { open: () => void }; } }
let loading: Promise<void> | undefined;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!loading) loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(); script.onerror = () => { loading = undefined; reject(new Error('Unable to load checkout. Please try again.')); }; document.head.appendChild(script);
  });
  return loading;
}
export async function checkout(bookingId: string): Promise<{ requires_refund: boolean }> {
  await loadCheckout();
  const order = await api<{ key: string; order_id: string; amount: number; currency: string }>(`/payments/${bookingId}/order`, { method: 'POST' });
  return new Promise((resolve, reject) => {
    const widget = new window.Razorpay({ ...order, name: 'CelebrateCG', description: 'Venue reservation', theme: { color: '#c55337' },
      handler: async (data: PaymentResult) => { try { resolve(await api('/payments/verify', { method: 'POST', body: JSON.stringify(data) })); } catch (e) { reject(e); } },
      modal: { ondismiss: () => reject(new Error('Checkout closed. Your reservation remains unpaid.')) },
    }); widget.open();
  });
}
