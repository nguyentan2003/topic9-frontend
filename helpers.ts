/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
        case "completed":
        case "hoàn thành":
            return "status-completed";
        case "pending":
        case "đang xử lý":
            return "status-pending";
        case "cancelled":
        case "đã hủy":
            return "status-cancelled";
        default:
            return "";
    }
}
