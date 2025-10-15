"use client";

import { UpdateOrderStatus } from "@/components/admin/update-order-status";
import { useRouter } from "next/navigation";

interface OrderUpdateSectionProps {
    orderId: string;
    currentStatus: string;
    currentTrackingCode?: string | null;
}

export function OrderUpdateSection({ orderId, currentStatus, currentTrackingCode }: OrderUpdateSectionProps) {
    const router = useRouter();

    const handleUpdate = () => {
        // Recarregar a página para mostrar os dados atualizados
        router.refresh();
    };

    return (
        <UpdateOrderStatus
            orderId={orderId}
            currentStatus={currentStatus}
            currentTrackingCode={currentTrackingCode}
            onUpdate={handleUpdate}
        />
    );
}
