import type { AlertItem } from '../types/hotel';
import { bookingAdminFetch } from './config';

interface GuestRequestResponseDto {
  id: number;
  kind: string;
  title: string;
  detail: string | null;
  resolved: string;
  time: string;
}

function toKind(kind: string): AlertItem['kind'] {
  const normalized = kind.toLowerCase();
  if (normalized === 'payment') return 'payment';
  if (normalized === 'request') return 'request';
  return 'system';
}

function toResolved(resolved: string): AlertItem['resolved'] {
  const normalized = resolved.toLowerCase();
  if (normalized === 'approved') return 'approved';
  if (normalized === 'dismissed') return 'dismissed';
  return 'pending';
}

function toAlert(dto: GuestRequestResponseDto): AlertItem {
  return {
    id: String(dto.id),
    kind: toKind(dto.kind),
    title: dto.title,
    detail: dto.detail ?? '',
    time: dto.time,
    resolved: toResolved(dto.resolved),
  };
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const alerts = await bookingAdminFetch<GuestRequestResponseDto[]>('/api/admin/alerts');
  return alerts.map(toAlert);
}

export async function resolveAlert(id: string, resolution: 'approved' | 'dismissed'): Promise<void> {
  await bookingAdminFetch<unknown>(`/api/admin/alerts/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ status: resolution.toUpperCase() }),
  });
}
