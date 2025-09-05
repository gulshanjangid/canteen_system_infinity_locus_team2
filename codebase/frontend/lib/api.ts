const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { const body = await res.json(); message = body?.error?.message || JSON.stringify(body); } catch {}
    throw new Error(message);
  }
  const data = await res.json();
  return data?.data ?? data; // accept both envelope and raw
}

export const api = {
  // Admin
  getAdminMenu: () => request('/admin/menu'),
  createMenuItem: (payload: { name: string; description: string; price_rupees: number; stock_count: number; image_url?: string }) =>
    request('/admin/menu', { method: 'POST', body: JSON.stringify(payload) }),
  updateMenuItem: (id: string, payload: Partial<{ name: string; description: string; price_rupees: number; stock_count: number; is_available: boolean; image_url?: string }>) =>
    request(`/admin/menu/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMenuItem: (id: string) => request(`/admin/menu/${id}`, { method: 'DELETE' }),

  // Public
  getMenu: () => request('/menu'),

  // Orders
  placeOrder: (payload: { client_id?: string; items: { itemId: string; quantity: number }[] }) =>
    request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  addItemsToOrder: (orderId: string, items: { itemId: string; quantity: number }[]) =>
    request(`/orders/${orderId}/add-items`, { method: 'POST', body: JSON.stringify({ items }) }),
  getOrder: (id: string) => request(`/orders/${id}`),
  cancelOrder: (id: string) => request(`/orders/${id}/cancel`, { method: 'POST' }),
  confirmOrder: (id: string) => request(`/orders/${id}/confirm`, { method: 'POST' }),
  completeOrder: (id: string) => request(`/orders/${id}/complete`, { method: 'POST' }),
  getHistory: (clientId?: string) => request(`/orders/history${clientId ? `?client_id=${clientId}` : ''}`),
};

export type Api = typeof api;


