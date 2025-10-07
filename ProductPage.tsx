import React, { useEffect, useState, useRef, use } from "react";
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

interface NotificationItem {
    id: string;
    message: string;
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
                console.log("👤 Thông tin người dùng:", res.data.result);
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
                console.log("📦 Dữ liệu sản phẩm:", res.data.result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAll();
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

        const index = selectedProductRef.current.findIndex(
            (item) => item.id === product.id
        );

        let newSelectedProduct: CartItem[] = [];
        if (index === -1) {
            newSelectedProduct = [
                { ...product, quantity: 1 },
                ...selectedProductRef.current,
            ];
        } else {
            newSelectedProduct = [...selectedProductRef.current];
            newSelectedProduct[index].quantity += 1;
        }

        selectedProductRef.current = newSelectedProduct;
        setSelectedProduct(newSelectedProduct);
        setTotalPrice((prevTotal) => prevTotal + product.price);
    };

    // ====================== ❌ Xóa khỏi giỏ ======================
    const handleRemoveFromCart = (product: CartItem) => {
        const index = selectedProduct.findIndex(
            (item) => item.id === product.id
        );
        const updatedSelectedProduct = [...selectedProduct];
        updatedSelectedProduct[index].quantity -= 1;

        if (updatedSelectedProduct[index].quantity === 0) {
            updatedSelectedProduct.splice(index, 1);
        }

        setSelectedProduct(updatedSelectedProduct);
        setTotalPrice(totalPrice - product.price);
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
    };

    // ====================== 🚪 Đăng xuất ======================
    const handleLogout = () => {
        localStorage.removeItem("role");
        navigate("/login");
    };

    // ====================== 🔔 Thông báo ======================
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        { id: "1", message: "Đơn hàng #1234 đã được xác nhận" },
        { id: "2", message: "Sản phẩm 'iPhone 15 Pro Max' sắp hết hàng" },
    ]);

    const [unreadCount, setUnreadCount] = useState<number>(
        notifications.length
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            const newNoti: NotificationItem = {
                id: String(Date.now()),
                message:
                    "Bạn có khuyến mãi mới - Giảm 15% cho đơn hàng hôm nay!",
            };
            setNotifications((prev) => [...prev, newNoti]);
            setUnreadCount((prev) => prev + 1);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const notificationContent = (
        <List
            dataSource={notifications}
            renderItem={(item) => (
                <List.Item key={item.id}>{item.message}</List.Item>
            )}
        />
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
