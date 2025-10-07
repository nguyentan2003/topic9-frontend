import React, { useEffect, useState } from "react";
import { Card, Typography, Divider, Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import "./OrderPage.css";
import axios from "axios";

const { Title, Text } = Typography;
const defaultImage = "default.jpg";
const baseURLImage = "http://localhost:8888/api/v1/product/uploads/";

interface OrderItem {
    productId: string;
    productName: string;
    priceAtTime: number;
    quantity: number;
    imageUrl: string;
}

interface Order {
    id: string;
    userId: string;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    address: string;
    orderId: string;
    orderDate: string;
    totalAmount: number;
    paymentType: string;
    orderStatus: string;
    shippingAddress: string;
    paymentStatus: string;
    statusStock: string;
    orderItemSummaries: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

const OrderPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchOrderInfo = async () => {
            try {
                if (!userId) return;
                const res = await axios.get(
                    `http://localhost:8888/api/v1/customer-summary/get-list-order-user/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setOrders(res.data.result || []);
                console.log("👤 Thông tin order:", res.data.result);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người mua:", error);
            }
        };
        fetchOrderInfo();
    }, []);

    // ✅ Tag trạng thái đơn
    const renderStatusTag = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Tag color="gold">⏳ Chờ xử lý</Tag>;
            case "SUCCESS":
                return <Tag color="green">✅ Thành công</Tag>;
            case "CANCELED":
                return <Tag color="red">❌ Đã hủy</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    // ✅ Xử lý chuyển sang trang thanh toán
    const handleGoToPayment = (order: Order) => {
        navigate("/payment", {
            state: {
                orderData: {
                    userId: order.userId,
                    totalAmount: order.totalAmount,
                    address: order.address,
                    paymentType: order.paymentType,
                    listItemDetail: order.orderItemSummaries,
                },
                result: {
                    id: order.orderId,
                    userId: order.userId,
                    status: order.orderStatus,
                    totalAmount: order.totalAmount,
                    paymentType: order.paymentType,
                    address: order.address,
                },
                fullName: order.fullName,
            },
        });
    };

    return (
        <div className="order-container">
            <div className="order-header">
                <Title level={2}>📦 Danh Sách Đơn Hàng</Title>
                <Button type="default" onClick={() => navigate("/user-page")}>
                    ⬅ Quay lại
                </Button>
            </div>

            <div className="order-grid">
                {orders.length === 0 ? (
                    <div className="no-order">
                        <Title level={4} type="secondary">
                            Hiện tại chưa có đơn hàng nào!
                        </Title>
                    </div>
                ) : (
                    orders.map((order) => (
                        <Card key={order.id} className="order-card">
                            <div className="order-top">
                                <div>
                                    <Text strong>Mã đơn:</Text> {order.orderId}
                                </div>
                                {renderStatusTag(order.orderStatus)}
                            </div>

                            <Divider style={{ margin: "8px 0" }} />

                            <div className="order-summary">
                                <p>
                                    <Text strong>Khách:</Text> {order.fullName}
                                </p>
                                <p>
                                    <Text strong>Tổng tiền:</Text>{" "}
                                    <span className="total">
                                        {order.totalAmount.toLocaleString(
                                            "vi-VN"
                                        )}{" "}
                                        ₫
                                    </span>
                                </p>
                                <p>
                                    <Text strong>Ngày đặt:</Text>{" "}
                                    {new Date(order.orderDate).toLocaleString(
                                        "vi-VN",
                                        {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        }
                                    )}
                                </p>
                                <p>
                                    <Text strong>Thanh toán:</Text>{" "}
                                    {order.paymentType === "PREPAID"
                                        ? "Thanh toán trước"
                                        : "Khi nhận hàng"}
                                </p>

                                {/* ✅ Hiển thị trạng thái thanh toán nếu đang PENDING */}
                                {order.orderStatus === "PENDING" && (
                                    <p>
                                        <Text strong>
                                            Trạng thái thanh toán:
                                        </Text>{" "}
                                        {order.paymentStatus === "PAID" ? (
                                            <Tag color="green">
                                                💰 Đã thanh toán
                                            </Tag>
                                        ) : (
                                            <>
                                                <Tag color="red">
                                                    💸 Chưa thanh toán
                                                </Tag>
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    style={{
                                                        marginLeft: 8,
                                                        backgroundColor:
                                                            "#1677ff",
                                                    }}
                                                    onClick={() =>
                                                        handleGoToPayment(order)
                                                    }
                                                >
                                                    💳 Thanh toán ngay
                                                </Button>
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>

                            <Divider style={{ margin: "8px 0" }} />

                            <div className="product-preview">
                                {order.orderItemSummaries.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="product-item"
                                    >
                                        <img
                                            src={
                                                item.imageUrl
                                                    ? `${baseURLImage}${item.imageUrl}`
                                                    : `${baseURLImage}${defaultImage}`
                                            }
                                            alt={item.productName}
                                        />
                                        <div>
                                            <Text strong>
                                                {item.productName}
                                            </Text>
                                            <div>
                                                {item.quantity} ×{" "}
                                                {item.priceAtTime.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                ₫
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderPage;
