/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// 🧱 Component nhỏ hiển thị thẻ thống kê
const StatCard = ({
    value,
    label,
}: {
    value: string | number;
    label: string;
}) => (
    <div className="stat-card">
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-label">{label}</p>
    </div>
);

interface JwtPayload {
    exp: number;
    sub?: string;
}

// interface OrderSummary {
//     orderId: string;
//     orderDate: string;
//     customerName: string;
//     totalAmount: number;
//     orderStatus: string;
// }
export interface OrderSummary {
    id: string;

    // Profile
    userId: string;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    address: string;

    // Order
    orderId: string;
    orderDate: string;
    totalAmount: number;
    paymentType: string;
    orderStatus: string;
    shippingAddress: string;
    // Payment
    paymentMethod: string;
    paymentStatus: string;
    transactionId: string;
    paymentTime: string;

    // Danh sách sản phẩm đã chọn trong order
    statusStock: string;

    createdAt: Date;
    updatedAt: Date;
    orderItemSummaries: {
        productId: string;
        productName: string;
        priceAtTime: number;
        imageUrl: string;
        quantity: number;
    }[];
}
export function Dashboard() {
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // 🧩 State cho phân trang & lọc
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showTodayOnly, setShowTodayOnly] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🧩 Kiểm tra token hợp lệ
    useEffect(() => {
        if (!token) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            navigate("/login");
            return;
        }

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("token");
                navigate("/login");
            }
        } catch (error) {
            console.error("Token không hợp lệ:", error);
            alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            navigate("/login");
        }
    }, [token, navigate]);

    // 🧩 Gọi API lấy danh sách đơn hàng
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8888/api/v1/customer-summary/get-all",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Nếu backend trả về data dạng { result: [...] }
                const result = res.data.result || [];
                const mappedOrders = result.map((o: any) => ({
                    orderId: o.orderId,
                    orderDate: o.orderDate,
                    customerName: o.customerName || o.username,
                    totalAmount: o.totalAmount,
                    orderStatus: o.orderStatus,
                    fullName: o.fullName,
                    orderItemSummaries: o.orderItemSummaries || [],
                    // Thêm các trường khác nếu cần
                }));

                setOrders(mappedOrders);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    // 🧮 Xử lý dữ liệu thống kê
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const todaysOrders = orders.filter(
        (o) => o.orderDate.split("T")[0] === today
    );
    const todaysRevenue = todaysOrders.reduce(
        (sum, o) => sum + o.totalAmount,
        0
    );

    const thisMonthOrders = orders.filter((o) => {
        const d = new Date(o.orderDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const thisMonthRevenue = thisMonthOrders.reduce(
        (sum, o) => sum + o.totalAmount,
        0
    );
    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            const confirmMsg =
                newStatus === "SHIPPING"
                    ? "Xác nhận giao hàng?"
                    : "Bạn có chắc muốn hủy đơn hàng này không?";

            if (!window.confirm(confirmMsg)) return;

            const res = await axios.patch(
                `http://localhost:8888/api/v1/order/update-status/${orderId}?status=${newStatus}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data);

            // Cập nhật lại trong UI
            setOrders((prevOrders) =>
                prevOrders.map((o) =>
                    o.orderId === orderId ? { ...o, orderStatus: newStatus } : o
                )
            );

            alert("✅ Cập nhật trạng thái đơn hàng thành công!");
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái:", error);
            alert("Không thể cập nhật trạng thái, vui lòng thử lại!");
        }
    };

    const formatCurrency = (amount: number) =>
        amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    // 🧾 Lấy  đơn hàng gần nhất
    const recentOrders = [...orders]
        .sort(
            (a, b) =>
                new Date(b.orderDate).getTime() -
                new Date(a.orderDate).getTime()
        )
        .slice(0, 1000);

    // 🧾 Chọn dữ liệu hiển thị (lọc hoặc tất cả) + Sắp xếp giảm dần theo thời gian
    const displayedOrders = (showTodayOnly ? todaysOrders : recentOrders).sort(
        (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );

    // 🧮 Tính phân trang
    const totalPages = Math.ceil(displayedOrders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = displayedOrders.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Tổng quan hệ thống</h2>
            </div>

            {/* 🧱 Thống kê */}
            <div className="stat-cards">
                <StatCard
                    value={formatCurrency(todaysRevenue)}
                    label="Doanh thu hôm nay"
                />
                <StatCard
                    value={todaysOrders.length}
                    label="Đơn hàng hôm nay"
                />
                <StatCard
                    value={formatCurrency(thisMonthRevenue)}
                    label="Doanh thu tháng này"
                />
                <StatCard
                    value={thisMonthOrders.length}
                    label="Đơn hàng tháng này"
                />
            </div>

            {/* 🧾 Đơn hàng gần nhất */}
            {/* 🧾 Đơn hàng gần nhất */}
            <div className="recent-orders">
                <div className="orders-header">
                    <h3>Đơn hàng gần nhất</h3>
                    <button
                        onClick={() => setShowTodayOnly((prev) => !prev)}
                        className="toggle-today-btn"
                    >
                        {showTodayOnly
                            ? "Hiển thị tất cả"
                            : "Xem đơn hàng hôm nay"}
                    </button>
                </div>

                {displayedOrders.length > 0 ? (
                    <>
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Ngày đặt</th>
                                    <th>Trạng thái</th>
                                    <th>Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map((order) => (
                                    <tr
                                        key={order.orderId}
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setIsModalOpen(true);
                                        }}
                                        className="order-row"
                                    >
                                        <td>{order.orderId}</td>
                                        <td>{order.fullName}</td>
                                        <td>
                                            {new Date(
                                                order.orderDate
                                            ).toLocaleString("vi-VN")}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${order.orderStatus}`}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {isModalOpen && selectedOrder && (
                            <div
                                className="modal-overlay"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <div
                                    className="modal-content"
                                    onClick={(e) => e.stopPropagation()} // tránh đóng khi click bên trong
                                >
                                    <h3>Chi tiết đơn hàng</h3>
                                    <p>
                                        <strong>Mã đơn:</strong>{" "}
                                        {selectedOrder.orderId}
                                    </p>
                                    <p>
                                        <strong>Khách hàng:</strong>{" "}
                                        {selectedOrder.fullName}
                                    </p>
                                    <p>
                                        <strong>Ngày đặt:</strong>{" "}
                                        {new Date(
                                            selectedOrder.orderDate
                                        ).toLocaleString("vi-VN")}
                                    </p>
                                    <p>
                                        <strong>Trạng thái:</strong>{" "}
                                        {selectedOrder.orderStatus}
                                    </p>
                                    <p>
                                        <strong>Tổng tiền:</strong>{" "}
                                        {selectedOrder.totalAmount.toLocaleString(
                                            "vi-VN",
                                            {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        )}
                                    </p>

                                    {selectedOrder.orderItemSummaries &&
                                        selectedOrder.orderItemSummaries
                                            .length > 0 && (
                                            <>
                                                <h4>Sản phẩm trong đơn</h4>
                                                <ul>
                                                    {selectedOrder.orderItemSummaries.map(
                                                        (
                                                            item: any,
                                                            idx: number
                                                        ) => (
                                                            <li key={idx}>
                                                                {
                                                                    item.productName
                                                                }{" "}
                                                                ×{" "}
                                                                {item.quantity}{" "}
                                                                —{" "}
                                                                {item.priceAtTime.toLocaleString(
                                                                    "vi-VN",
                                                                    {
                                                                        style: "currency",
                                                                        currency:
                                                                            "VND",
                                                                    }
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </>
                                        )}
                                    {selectedOrder.orderStatus ===
                                        "SUCCESS" && (
                                        <div className="status-actions">
                                            <button
                                                className="btn-shipping-order"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        selectedOrder.orderId,
                                                        "SHIPPING"
                                                    )
                                                }
                                            >
                                                Giao Hàng
                                            </button>
                                            <button
                                                className="btn-cancel-order"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        selectedOrder.orderId,
                                                        "CANCELED"
                                                    )
                                                }
                                            >
                                                Hủy đơn
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        className="close-btn"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Thanh phân trang */}
                        <div className="pagination">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                ←
                            </button>
                            <span>
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                →
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Không có đơn hàng nào.</p>
                )}
            </div>
        </div>
    );
}
