/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from "react";
import "./AdminPage.css";
import { ProductManagement } from "./ProductManagement";

import UserManagement from "./UserManagement";
import { DeliveryManagement } from "./DeliveryManagement";
import { Dashboard } from "./Dashboard";
import { useNavigate } from "react-router-dom";
type View = "dashboard" | "products" | "orders" | "users" | "delivery";

export function AdminPage() {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<View>("dashboard");
    const userRole = localStorage.getItem("role");

    console.log("userRole:", userRole);

    // 🧩 Chuyển hướng người dùng không phải admin
    useEffect(() => {
        if (userRole === "ROLE_USER") {
            navigate("/user-page");
        }
    }, [userRole, navigate]);
    const renderView = () => {
        switch (currentView) {
            case "dashboard":
                return <Dashboard />;
            case "products":
                return <ProductManagement />;

            case "users":
                return <UserManagement />;
            case "delivery":
                return <DeliveryManagement />;
            default:
                return <Dashboard />;
        }
    };

    const NavLink = ({ view, label }: { view: View; label: string }) => (
        <li>
            <button
                onClick={() => setCurrentView(view)}
                className={currentView === view ? "active" : ""}
            >
                {label}
            </button>
        </li>
    );

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>Admin</h1>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <NavLink view="dashboard" label="Thống kê đơn hàng" />
                        <NavLink view="products" label="Sản phẩm" />
                        {/* <NavLink view="orders" label="Đơn hàng" /> */}
                        <NavLink view="users" label="Người dùng" />
                        <NavLink view="delivery" label="Giao hàng" />
                    </ul>
                </nav>
            </aside>
            <main className="main-content">{renderView()}</main>
        </div>
    );
}
