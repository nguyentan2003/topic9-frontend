import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Login from "./Login";
import { AdminPage } from "./AdminPage";
import ProductPage from "./ProductPage";
import PaymentPage from "./PaymentPage";
import OrderPage from "./OrderPage";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Chuyển hướng / -> /login */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Route đăng nhập */}
                <Route path="/login" element={<Login />} />
                {/* Route trang user */}
                <Route path="/user-page" element={<ProductPage />} />
                <Route path="/orders" element={<OrderPage />} />
                {/* Route trang user */}
                <Route path="/payment" element={<PaymentPage />} />

                {/* Route trang admin */}
                <Route path="/admin-page" element={<AdminPage />} />
            </Routes>
        </Router>
    );
};

export default App;
