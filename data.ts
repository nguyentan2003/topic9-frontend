/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
}

export interface Order {
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

export interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "editor" | "viewer";
}

export interface DeliveryStatus {
    id: string;
    order_id: number;
    status: "processing" | "shipped" | "in_transit" | "delivered" | "failed";
    tracking_number: string;
    shipping_date: string;
    delivery_date: string; // Estimated or actual
    current_position: string;
    address: string;
}

export const products: Product[] = [
    {
        id: 1,
        name: "Laptop Pro",
        category: "Electronics",
        price: 35000000,
        stock: 50,
    },
    {
        id: 2,
        name: "Smartphone X",
        category: "Electronics",
        price: 20000000,
        stock: 150,
    },
    {
        id: 3,
        name: "Wireless Headphones",
        category: "Accessories",
        price: 2500000,
        stock: 300,
    },
    {
        id: 4,
        name: "Coffee Maker",
        category: "Home Appliances",
        price: 1800000,
        stock: 100,
    },
    {
        id: 5,
        name: "Running Shoes",
        category: "Apparel",
        price: 3200000,
        stock: 200,
    },
];

const getToday = () => new Date().toISOString().split("T")[0];

export const orders: Order[] = [
   
];

export const users: User[] = [
    { id: 1, name: "Admin User", email: "admin@example.com", role: "admin" },
    { id: 2, name: "Editor User", email: "editor@example.com", role: "editor" },
    { id: 3, name: "Viewer User", email: "viewer@example.com", role: "viewer" },
];

export const deliveryStatuses: DeliveryStatus[] = [
    {
        id: "track-001",
        order_id: 101,
        status: "delivered",
        tracking_number: "VN123456789",
        shipping_date: "2024-07-21",
        delivery_date: "2024-07-23",
        current_position: "Đã giao",
        address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    {
        id: "track-002",
        order_id: 102,
        status: "in_transit",
        tracking_number: "VN987654321",
        shipping_date: "2024-07-22",
        delivery_date: "2024-07-25",
        current_position: "Khoソート Hà Nội",
        address: "456 Đường XYZ, Hoàn Kiếm, Hà Nội",
    },
    {
        id: "track-003",
        order_id: 103,
        status: "processing",
        tracking_number: "",
        shipping_date: "",
        delivery_date: "",
        current_position: "Đang xử lý tại kho",
        address: "789 Đường DEF, Sơn Trà, Đà Nẵng",
    },
];
