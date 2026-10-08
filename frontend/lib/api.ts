export type User = { id: string; name: string; email: string; role: 'customer' | 'vendor' | 'admin'; approval_status: string };
export type Category = { id: string; name: string; slug: string; type: 'venue' | 'service' };
export type CitySummary = { name: string; venue_count: number; image: string };
export type VenuePhoto = { id: string; url: string; sort_order: number };
export type Venue = { id: string; name: string; description: string; location_text: string; price_per_day: string; max_guests: number; facilities: string[]; category: string; category_id: string; category_slug: string; categories: Category[]; category_ids: string[]; photos: string[]; photo_items: VenuePhoto[]; rules: string; cancellation_policy: string; approval_status: string };
export type Offer = { id: string; code: string; name: string; discount_type: 'percentage' | 'fixed'; discount_value: string; starts_at: string; expires_at: string; minimum_booking_amount: string; usage_limit: number | null; times_used: number; is_active: boolean; status: 'inactive' | 'expired' | 'scheduled' | 'used_up' | 'active' };
export type OfferValidation = { offer: Offer; base_amount: string; discount_amount: string; final_amount: string };
export type Booking = { id: string; venue_id: string; venue_name: string; booking_date: string; customer_id?: string; customer_name?: string; customer_email?: string; guest_count: number; base_amount: string; discount_amount: string; offer_id: string | null; offer_code: string | null; total_amount: string; status: string; expires_at: string };
export type Health = { demo_mode: boolean; payments_enabled: boolean };
/** Callback set by UI components to show "server is waking up" state */
let wakeUpListener: ((waking: boolean) => void) | null = null;
export function onWakeUp(listener: ((waking: boolean) => void) | null) { wakeUpListener = listener; }

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = options?.body instanceof FormData ? options?.headers : { 'Content-Type': 'application/json', ...options?.headers };
  const isRead = !options?.method || options.method === 'GET';
  const maxRetries = isRead ? 4 : 1;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`/api${path}`, { ...options, credentials: 'same-origin', headers });
      const data = await response.json().catch(() => ({}));
      if (response.status === 503 && attempt < maxRetries) {
        wakeUpListener?.(true);
        await new Promise(resolve => setTimeout(resolve, 10_000));
        continue;
      }
      if (!response.ok) {
        const detail = data.detail;
        throw new Error(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((e: { msg: string }) => e.msg).join('. ') : 'Something went wrong. Please try again.');
      }
      wakeUpListener?.(false);
      return data;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        wakeUpListener?.(true);
        await new Promise(resolve => setTimeout(resolve, 10_000));
        continue;
      }
    }
  }
  wakeUpListener?.(false);
  throw lastError ?? new Error('Unable to reach the server. Please try again.');
}
export const money = (value: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value));
export const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
