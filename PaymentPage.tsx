import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PaymentPage.css";

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    priceAtTime: number;
    imageUrl: string;
}

interface OrderData {
    userId: string;
    totalAmount: number;
    address: string;
    paymentType: string;
    orderDate?: string;
    listItemDetail?: OrderItem[];
    [key: string]: any;
}

interface OrderResult {
    id: string;
    userId: string;
    status: string;
    totalAmount: number;
    paymentType: string;
    address: string;
    [key: string]: any;
}

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Dữ liệu truyền từ trang trước
    const state = location.state as {
        orderData?: OrderData;
        result?: OrderResult;
        fullName?: string;
    } | null;

    const [orderData, setOrderData] = useState<OrderData | null>(
        state?.orderData || null
    );
    const [orderResult, setOrderResult] = useState<OrderResult | null>(
        state?.result || null
    );

    // ✅ Khôi phục dữ liệu khi reload
    useEffect(() => {
        if (state?.orderData && state?.result) {
            sessionStorage.setItem(
                "orderData",
                JSON.stringify(state.orderData)
            );
            sessionStorage.setItem("orderResult", JSON.stringify(state.result));
        } else {
            const savedOrder = sessionStorage.getItem("orderData");
            const savedResult = sessionStorage.getItem("orderResult");
            if (savedOrder && savedResult) {
                setOrderData(JSON.parse(savedOrder));
                setOrderResult(JSON.parse(savedResult));
            }
        }
    }, [state]);

    // ✅ Kiểm tra dữ liệu
    if (!orderData || !orderResult) {
        return (
            <div className="error-page">
                <p>⚠️ Không có dữ liệu đơn hàng.</p>
                <button className="btn" onClick={() => navigate("/")}>
                    Quay lại
                </button>
            </div>
        );
    }

    // 🔹 Hàm gửi trạng thái thanh toán
    const sendPaymentStatus = async (status: string) => {
        try {
            const payload = {
                orderId: orderResult.id,
                paymentMethod: "VISA",
                amount: orderData.totalAmount,
                status: status, // SUCCESS hoặc FAILED
                transactionId: "TXN_" + Math.floor(Math.random() * 1000000),
                paymentTime: new Date()
                    .toLocaleString("vi-VN", { hour12: false })
                    .replace(",", "__"),
            };

            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:8888/api/v1/payment/create",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("✅ Phản hồi từ server:", res.data);
            return true;
        } catch (error) {
            console.error("❌ Lỗi khi gửi API thanh toán:", error);
            throw error;
        }
    };

    // ✅ Khi xác nhận thanh toán
    const handlePayment = async (): Promise<void> => {
        try {
            await sendPaymentStatus("SUCCESS");
            alert("💰 Thanh toán thành công!");
            sessionStorage.removeItem("orderData");
            sessionStorage.removeItem("orderResult");
            navigate("/user-page");
        } catch {
            alert("⚠️ Thanh toán thất bại!");
        }
    };

    // ✅ Khi hủy thanh toán → quay lại giỏ hàng và khôi phục sản phẩm
    const handleCancel = async (): Promise<void> => {
        try {
            await sendPaymentStatus("FAILED");
            alert("🚫 Thanh toán đã bị hủy!");

            // 🔹 Lưu lại danh sách sản phẩm đã chọn (nếu có)
            if (
                orderData.listItemDetail &&
                orderData.listItemDetail.length > 0
            ) {
                sessionStorage.setItem(
                    "cartItems",
                    JSON.stringify(orderData.listItemDetail)
                );
            }

            // 🔹 Chuyển về giỏ hàng
            navigate("/user-page", { replace: true });
        } catch {
            alert("⚠️ Không thể gửi trạng thái hủy!");
        }
    };

    return (
        <motion.div
            className="payment-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div className="payment-card" whileHover={{ scale: 1.02 }}>
                <h2>💳 Thanh toán đơn hàng</h2>

                <div className="order-info">
                    <p>
                        <b>Mã đơn hàng:</b> {orderResult.id}
                    </p>
                    <p>
                        <b>Tổng tiền:</b>{" "}
                        {orderData.totalAmount.toLocaleString()}đ
                    </p>
                    <p>
                        <b>Trạng thái:</b> {orderResult.status}
                    </p>
                    <p>
                        <b>Người mua:</b>{" "}
                        {state?.fullName || "Nguyễn Trọng Tấn"}
                    </p>
                    <p>
                        <b>Địa chỉ:</b> {orderData.address}
                    </p>
                </div>

                <input type="text" placeholder="Số thẻ" className="input-box" />
                <div className="row">
                    <input
                        type="text"
                        placeholder="MM/YY"
                        className="input-half"
                    />
                    <input
                        type="text"
                        placeholder="CVV"
                        className="input-half"
                    />
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePayment}
                    className="btn-pay"
                >
                    Xác nhận thanh toán
                </motion.button>

                <button className="btn-cancel" onClick={handleCancel}>
                    Hủy
                </button>
            </motion.div>
        </motion.div>
    );
};

export default PaymentPage;
