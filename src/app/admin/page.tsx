import { getAdminDashboard } from '@/lib/actions/admin';
import DashboardClient from '@/components/admin/DashboardClient';

export default async function AdminDashboardPage() {
    const data = await getAdminDashboard(7);

    if (!data) {
        return (
            <div className="admin-card rounded-2xl p-16 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Failed to load dashboard data.
                </p>
            </div>
        );
    }

    return <DashboardClient initialData={data} />;
}
