import { getAdminCoupons } from '@/lib/actions/coupons';
import CouponManager, { type SerializableCoupon } from './CouponManager';

export default async function AdminCouponsPage() {
    const coupons = await getAdminCoupons();

    const initialCoupons: SerializableCoupon[] = coupons.map((c) => ({
        ...c,
        isPublic: c.isPublic ?? true,
        startsAt: c.startsAt ? c.startsAt.toISOString() : null,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
    }));

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Coupons</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                        Create codes and control discount figures
                    </p>
                </div>
            </div>

            <CouponManager initialCoupons={initialCoupons} />
        </div>
    );
}
