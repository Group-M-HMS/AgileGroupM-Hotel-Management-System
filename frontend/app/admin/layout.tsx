import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { HotelDataProvider } from './_lib/contexts/HotelDataContext';
import { AdminShell } from './_components/AdminShell';
import { AdminAuthGate } from './_components/AdminAuthGate';

export const metadata: Metadata = {
  title: 'Operations Console — River Nest Eco Villa',
  description: 'Front desk, housekeeping and reservations console for River Nest Eco Villa.',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <HotelDataProvider>
        <AdminShell>{children}</AdminShell>
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
      </HotelDataProvider>
    </AdminAuthGate>
  );
}
