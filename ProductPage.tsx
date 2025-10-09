import React, { useEffect, useState, useRef, use } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { jwtDecode } from "jwt-decode";
import {
    BellOutlined,
    ShoppingCartOutlined,
    OrderedListOutlined,
} from "@ant-design/icons";

import axios from "axios";
import {
    Card,
    Input,
    Button,
    List,
    Typography,
    Divider,
    Modal,
    Form,
    Popover,
    Badge,
} from "antd";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;
const { Search } = Input;
const { Text } = Typography;
const defaultImage = "default.jpg";
const baseURLImage = "http://localhost:8888/api/v1/product/uploads/";
// ====================== 🧩 Interface định nghĩa kiểu dữ liệu ======================
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    type: string;
    reservedStock: number;
    imageUrl: string;
}

interface CartItem extends Product {
    quantity: number;
}
interface JwtPayload {
    exp: number; // thời gian hết hạn (UNIX timestamp)
    sub?: string; // ID user
    [key: string]: any; // các trường khác
}

interface NotificationItem {
    id: string;
    message: string;
    notificationId: string;
    userId: string;
    read: boolean;
    sentAt: Date;
    type: string;
}

// ====================== 🧱 Component chính ======================
const ProductPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const [dataAllProduct, setDataAllProduct] = useState<Product[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");

    const selectedProductRef = useRef<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<CartItem[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [buyerName, setBuyerName] = useState<string>("");
    const [address, setAddress] = useState<string>("Thôn 4, Quỳnh Giang");
    const [paymentType, setPaymentType] = useState<string>("PREPAID");

    // Modal (nếu cần sửa sản phẩm)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [updateProduct, setUpdateProduct] = useState<Product | null>(null);

    // Thông tin người mua
    const [userInfo, setUserInfo] = useState(null);
    // ====================== 🔔 Thông báo ======================
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    //  { id: "1", message: "Đơn hàng #1234 đã được xác nhận" },
    //         { id: "2", message: "Sản phẩm 'iPhone 15 Pro Max' sắp hết hàng" },
    const [unreadCount, setUnreadCount] = useState<number>(
        notifications.length
    );

    // ================ 🧩 NEW — Khôi phục giỏ hàng từ localStorage khi load trang ================
    useEffect(() => {
        const savedCart = localStorage.getItem("selectedProduct");
        const savedTotal = localStorage.getItem("totalPrice");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart) as CartItem[];
                setSelectedProduct(parsed);
                selectedProductRef.current = parsed;
            } catch (e) {
                console.error(
                    "Lỗi khi parse selectedProduct từ localStorage",
                    e
                );
            }
        }
        if (savedTotal) {
            const num = Number(savedTotal);
            if (!Number.isNaN(num)) setTotalPrice(num);
        }
    }, []);

    useEffect(() => {
        const unread = notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem(
            "selectedProduct",
            JSON.stringify(selectedProduct)
        );
        localStorage.setItem("totalPrice", String(totalPrice));
    }, [selectedProduct, totalPrice]);

    // ================ 🧩 NEW — Lưu giỏ hàng & tổng tiền vào localStorage khi thay đổi ================
    useEffect(() => {
        try {
            localStorage.setItem(
                "selectedProduct",
                JSON.stringify(selectedProduct)
            );
            localStorage.setItem("totalPrice", String(totalPrice));
        } catch (e) {
            console.error("Lỗi khi lưu selectedProduct vào localStorage", e);
        }
    }, [selectedProduct, totalPrice]);
    // ====================== 🧩 Kiểm tra token hợp lệ ======================
    useEffect(() => {
        const checkTokenValidity = async () => {
            if (!token) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                navigate("/login");
                return;
            }

            try {
                const decoded = jwtDecode<JwtPayload>(token);

                if (!decoded.exp) {
                    console.warn(
                        "Token không có trường exp, không thể kiểm tra."
                    );
                    return;
                }

                const currentTime = Date.now() / 1000; // tính theo giây

                if (decoded.exp < currentTime) {
                    // token hết hạn
                    alert(
                        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"
                    );
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                // ✅ Nếu còn hạn thì bạn có thể tiếp tục gọi API khác ở đây nếu muốn
            } catch (error) {
                console.error("❌ Token không hợp lệ:", error);
                alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        checkTokenValidity();
    }, [token]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // hoặc lấy từ cookie
                if (!userId) return;

                const res = await axios.get(
                    `http://localhost:8888/api/v1/identity/users/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Thêm Bearer Token
                        },
                    }
                );

                setUserInfo(res.data.result);
                setBuyerName(res.data.result.fullName || "Tấn");
                setAddress(res.data.result.address || "Thôn 4, Quỳnh Giang");
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người mua:", error);
            }
        };

        fetchUserInfo();
    }, []);

    // ====================== 📦 Load dữ liệu ======================
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const token = localStorage.getItem("token"); // Lấy token từ localStorage

                const res = await axios.get(
                    "http://localhost:8888/api/v1/product/list",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Thêm Bearer Token
                        },
                    }
                );

                setDataAllProduct(res.data.result || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAll();
    }, []);

    useEffect(() => {
        // 👉 Kết nối SSE với Bearer Token
        const eventSource = new EventSourcePolyfill(
            `http://localhost:8888/api/v1/notifications/stream/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                heartbeatTimeout: 60000000000, // optional: timeout reconnect
            }
        );

        eventSource.addEventListener("notification", (event) => {
            const notification = JSON.parse(event.data);
            console.log("📩 Nhận thông báo:", notification);

            setNotifications((prev) => [
                { ...notification, read: false },
                ...prev,
            ]);
        });

        eventSource.onerror = (err) => {
            console.error("❌ Lỗi SSE:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        const fetchAllNotification = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8888/api/v1/notifications/get-notification-of-user/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Thêm Bearer Token
                        },
                    }
                );

                setNotifications(res.data.result || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAllNotification();
    }, []);

    // ====================== 🔍 Search ======================
    const handleSearch = (value: string) => {
        setSearchKeyword(value);
    };

    // ====================== ➕ Thêm vào giỏ ======================
    const handleAddToCart = (product: Product) => {
        if (product.stockQuantity - product.reservedStock === 0) {
            alert("Sản phẩm này đã hết hàng!");
            return;
        }

        const existingIndex = selectedProduct.findIndex(
            (item) => item.id === product.id
        );

        let updatedCart;
        if (existingIndex === -1) {
            updatedCart = [{ ...product, quantity: 1 }, ...selectedProduct];
        } else {
            updatedCart = [...selectedProduct];
            updatedCart[existingIndex].quantity += 1;
        }

        const newTotal = totalPrice + product.price;

        setSelectedProduct(updatedCart);
        setTotalPrice(newTotal);

        // 🧩 Đồng bộ localStorage
        localStorage.setItem("selectedProduct", JSON.stringify(updatedCart));
        localStorage.setItem("totalPrice", String(newTotal));
    };

    // ====================== ❌ Xóa khỏi giỏ ======================
    const handleRemoveFromCart = (product: CartItem) => {
        const existingIndex = selectedProduct.findIndex(
            (item) => item.id === product.id
        );
        if (existingIndex === -1) return;

        const updatedCart = [...selectedProduct];
        updatedCart[existingIndex].quantity -= 1;

        if (updatedCart[existingIndex].quantity <= 0) {
            updatedCart.splice(existingIndex, 1);
        }

        const newTotal = totalPrice - product.price;

        setSelectedProduct(updatedCart);
        setTotalPrice(newTotal);

        // 🧩 Đồng bộ localStorage
        localStorage.setItem("selectedProduct", JSON.stringify(updatedCart));
        localStorage.setItem("totalPrice", String(newTotal));
    };

    // ====================== 💰 Thanh toán ======================
    const handleCheckout = async () => {
        if (selectedProduct.length === 0) {
            alert("Giỏ hàng đang trống!");
            return;
        }

        try {
            const orderData = {
                userId: userId,
                orderDate: new Date().toISOString(),
                status: "PENDING",
                totalAmount: totalPrice,
                paymentType: paymentType,
                address: address,
                listItemDetail: selectedProduct.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    priceAtTime: item.price,
                })),
            };

            console.log("📦 Gửi đơn hàng:", orderData);

            const response = await axios.post(
                "http://localhost:8888/api/v1/order/create",
                orderData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                alert("Đặt hàng thành công!");
                console.log("✅ Đơn hàng đã được tạo:", response.data);

                setSelectedProduct([]);
                setTotalPrice(0);
                // 🧩 NEW — xoá localStorage sau khi đặt hàng thành công (giữ logic cũ nhưng đồng bộ với localStorage)
                localStorage.removeItem("selectedProduct");
                localStorage.removeItem("totalPrice");
                // setBuyerName("");
            } else {
                alert("Đặt hàng thất bại, vui lòng thử lại!");
            }

            if (paymentType === "PREPAID") {
                navigate("/payment", {
                    state: {
                        orderData,
                        result: response.data.result,
                        fullName: buyerName,
                    },
                });
            }
        } catch (error) {
            console.error("❌ Lỗi khi tạo đơn hàng:", error);
            alert("Có lỗi xảy ra khi gửi đơn hàng!");
        }
    };

    // ====================== 🔄 Làm mới giỏ hàng ======================
    const handleClearCart = () => {
        setSelectedProduct([]);
        selectedProductRef.current = [];
        setTotalPrice(0);
        // 🧩 NEW — xoá localStorage khi làm mới giỏ
        localStorage.removeItem("selectedProduct");
        localStorage.removeItem("totalPrice");
    };

    // ====================== 🚪 Đăng xuất ======================
    const handleLogout = () => {
        localStorage.removeItem("role");
        navigate("/login");
    };

    const notificationContent = (
        <div
            style={{
                maxHeight: "400px",
                overflowY: "auto",
                width: "350px",
            }}
        >
            <List
                dataSource={notifications}
                locale={{ emptyText: "Không có thông báo nào" }}
                renderItem={(item) => (
                    <List.Item
                        key={item.notificationId}
                        style={{
                            backgroundColor: item.read ? "#fff" : "#e6f7ff",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            padding: "10px 14px",
                            boxShadow: item.read
                                ? "none"
                                : "0 0 5px rgba(24,144,255,0.3)",
                            transition: "all 0.3s ease",
                        }}
                    >
                        <div style={{ width: "100%" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    strong
                                    style={{
                                        color: item.read ? "#555" : "#1890ff",
                                    }}
                                >
                                    {item.type || "Thông báo"}
                                </Text>
                                {!item.read && (
                                    <span
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            backgroundColor: "#52c41a",
                                            display: "inline-block",
                                        }}
                                    ></span>
                                )}
                            </div>
                            <div style={{ marginTop: "4px" }}>
                                <Text>{item.message}</Text>
                            </div>
                            <div
                                style={{
                                    marginTop: "6px",
                                    fontSize: "12px",
                                    color: "#999",
                                }}
                            >
                                {new Date(item.sentAt).toLocaleString("vi-VN")}
                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );

    const cartContent = (
        <List
            dataSource={selectedProduct}
            renderItem={(item) => (
                <List.Item key={item.id}>
                    {item.name} - SL: {item.quantity}
                </List.Item>
            )}
        />
    );
    // Khi mở popover thông báo
    const handleOpenNotification = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);

        // (tùy chọn) gửi cập nhật lên server
        try {
            await axios.patch(
                `http://localhost:8888/api/v1/notifications/mark-read/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("❌ Lỗi khi cập nhật đã đọc:", err);
        }
    };

    // ====================== 🧾 Giao diện ======================
    const renderCards = () =>
        dataAllProduct
            .filter((product) =>
                product.name.toLowerCase().includes(searchKeyword.toLowerCase())
            )
            .map((product) => (
                <Card
                    key={product.id}
                    hoverable
                    style={{
                        width: 240,
                        margin: "10px",
                        backgroundColor: "#fafafa",
                        borderRadius: "12px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    cover={
                        <img
                            alt={product.name}
                            src={
                                product.imageUrl
                                    ? `${baseURLImage}${product.imageUrl}`
                                    : `${baseURLImage}${defaultImage}`
                            }
                            style={{
                                height: "150px",
                                objectFit: "cover",
                                borderTopLeftRadius: "12px",
                                borderTopRightRadius: "12px",
                            }}
                        />
                    }
                    onClick={() => {
                        if (localStorage.getItem("role") === "admin")
                            return setIsModalOpen(true);
                    }}
                >
                    <Meta
                        title={product.name}
                        description={
                            <>
                                <Text strong>Giá: </Text>
                                {product.price.toLocaleString("vi-VN")} VND{" "}
                                <br />
                                <Text strong>Còn lại: </Text>
                                {product.stockQuantity - product.reservedStock}
                            </>
                        }
                    />
                    <Button
                        type="primary"
                        style={{ marginTop: "10px" }}
                        disabled={
                            product.stockQuantity - product.reservedStock === 0
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                        }}
                    >
                        Thêm vào giỏ
                    </Button>
                </Card>
            ));

    // ====================== 🧩 Render chính ======================
    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "20px",
                backgroundColor: "#f2f4f7",
                minHeight: "100vh",
            }}
        >
            <div
                style={{
                    borderRight: "1px solid #ddd",
                    width: "70%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
            >
                <h1 style={{ textAlign: "center", color: "#333" }}>
                    🛍️ DANH SÁCH SẢN PHẨM
                </h1>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Search
                        placeholder="Tìm kiếm sản phẩm"
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: "500px", marginBottom: "20px" }}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {renderCards()}
                </div>
            </div>

            <Divider
                type="vertical"
                style={{ height: "100%", margin: "0 20px" }}
            />

            <div style={{ width: "25%" }}>
                <div style={{ marginTop: "20px" }}>
                    <div
                        style={{
                            display: "flex",
                            marginTop: "10px",
                            alignItems: "center",
                            justifyContent: "space-around",
                            gap: "15px",
                        }}
                    >
                        {/* 🛒 Giỏ hàng */}
                        <Popover
                            placement="bottomLeft"
                            title="Giỏ hàng"
                            content={cartContent}
                            trigger="click"
                        >
                            <Badge
                                count={selectedProduct.length}
                                offset={[0, 6]}
                            >
                                <ShoppingCartOutlined
                                    style={{
                                        fontSize: "24px",
                                        cursor: "pointer",
                                        color: "#444",
                                    }}
                                />
                            </Badge>
                        </Popover>
                        {/* 📦 Đơn hàng của tôi */}
                        <Badge count={0} offset={[0, 6]}>
                            <OrderedListOutlined
                                style={{
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#444",
                                }}
                                onClick={() => navigate("/orders")}
                            />
                        </Badge>

                        {/* 🔔 Thông báo */}
                        <Popover
                            placement="bottomLeft"
                            title="Thông báo"
                            content={notificationContent}
                            trigger="click"
                            onOpenChange={(visible) => {
                                if (visible) handleOpenNotification();
                            }}
                        >
                            <Badge count={unreadCount} offset={[0, 6]}>
                                <BellOutlined
                                    style={{
                                        fontSize: "24px",
                                        cursor: "pointer",
                                        color: "#444",
                                    }}
                                />
                            </Badge>
                        </Popover>

                        {/* 🚪 Đăng xuất */}
                        <Button
                            onClick={handleLogout}
                            type="primary"
                            style={{ backgroundColor: "#ff4d4f" }}
                        >
                            Đăng Xuất
                        </Button>
                    </div>

                    <Divider>🧾 Giỏ Hàng</Divider>

                    <List
                        dataSource={selectedProduct}
                        renderItem={(item) => (
                            <List.Item key={item.id}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <img
                                        alt={item.name}
                                        src={
                                            item.imageUrl
                                                ? `${baseURLImage}${item.imageUrl}`
                                                : `${baseURLImage}${defaultImage}`
                                        }
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            objectFit: "cover",
                                            marginRight: "10px",
                                            borderRadius: "10px",
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <Meta
                                            title={item.name}
                                            description={
                                                <>
                                                    <Text strong>Giá: </Text>
                                                    {item.price.toLocaleString(
                                                        "vi-VN"
                                                    )}{" "}
                                                    VND <br />
                                                    <Text strong>
                                                        Số lượng:{" "}
                                                    </Text>
                                                    {item.quantity}
                                                </>
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="link"
                                        danger
                                        onClick={() =>
                                            handleRemoveFromCart(item)
                                        }
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </List.Item>
                        )}
                    />
                    <Divider />
                    <input
                        placeholder="Nhập Tên Người Mua"
                        value={userInfo ? (userInfo as any).fullName : "Tấn"}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "12px",
                            width: "90%",
                            border: "1px solid #ccc",
                            marginBottom: "10px",
                        }}
                        onChange={(e) =>
                            setBuyerName(
                                userInfo ? (userInfo as any).fullName : "Tấn"
                            )
                        }
                    />
                    <input
                        placeholder="Địa chỉ giao hàng"
                        value={address}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "12px",
                            width: "90%",
                            border: "1px solid #ccc",
                            marginBottom: "10px",
                        }}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "12px",
                            width: "90%",
                            marginBottom: "10px",
                        }}
                    >
                        <option value="PREPAID">Thanh toán trước</option>
                        <option value="POSTPAID">
                            Thanh toán khi nhận hàng
                        </option>
                    </select>

                    <Typography.Title level={4}>
                        Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VND
                    </Typography.Title>
                    <Button type="primary" onClick={handleCheckout}>
                        Đặt Hàng
                    </Button>
                    <Button
                        danger
                        style={{ marginLeft: "10px" }}
                        onClick={handleClearCart}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
