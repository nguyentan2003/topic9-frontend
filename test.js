import React, { useEffect, useState } from "react";
import defaultAvatar from "../assets/img/avatar-layout.jpg";
import { useNavigate } from "react-router-dom";
import { EventSourcePolyfill } from "event-source-polyfill";

function InformationFloatAdmin({ showInfo }) {
    const navigate = useNavigate();

    // Fake user data (thay bằng dữ liệu thật từ session/cookie)
    const user = {
        name: "Nguyễn Trọng Tấn",
        email: "tantantan19052003@gmail.com",
        address: "Thôn 4, Quỳnh Giang, Quỳnh Lưu",
        phone: "0377386***",
        avatar: defaultAvatar,
        baseLinkWeb: "http://localhost:3456",
        rolePage: "admin",
        userId: 123,
    };

    // Fake token (thay bằng token thật từ localStorage/session)
    const token =
        "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJzYW1zdW5nLmNvbSIsInN1YiI6IjY2NTg4MTk1LTA5ZWYtNGQ5MC05OGM5LWNkMjQ5NjBjNjUxMyIsImV4cCI6MTc1ODY4NjE3MiwiaWF0IjoxNzU4NjgyNTcyLCJqdGkiOiI2ZGIyOGFmZi1jMzVhLTQxNDgtOTRjMS0wY2VkMmE2MzQ4YTciLCJzY29wZSI6IlJPTEVfQURNSU4ifQ.S1c_IGG33FGHPPD0tzHXM3j3wdi4tdjtypE1Nq-E-ozF_gcILmsPe3N5C_seu8g5J3KurvgFB2qKU4xlDlgZww";

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Gắn sự kiện cho các nút
        const logoutButton = document.querySelector(
            ".information-btn .btn__logout"
        );
        const fixInfoButton = document.querySelector(
            ".information-btn .btn__fixInfo"
        );

        if (logoutButton) {
            logoutButton.addEventListener("click", () => {
                navigate(`/logout`);
            });
        }

        if (fixInfoButton) {
            fixInfoButton.addEventListener("click", () => {
                navigate(`/${user.rolePage}/nguoi-dung/update/${user.userId}`);
            });
        }

        // 👉 Kết nối SSE với Bearer Token
        const eventSource = new EventSourcePolyfill(
            `http://localhost:8888/api/v1/notifications/stream/DEMO`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                heartbeatTimeout: 60000, // optional: timeout reconnect
            }
        );

        eventSource.addEventListener("notification", (event) => {
            const notification = JSON.parse(event.data);
            console.log("📩 Nhận thông báo:", notification);

            setNotifications((prev) => [...prev, notification]);
        });

        eventSource.onerror = (err) => {
            console.error("❌ Lỗi SSE:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div
            className={`header__information-float ${showInfo ? "active" : ""}`}
        >
            <div className="information-float__top">
                <img src={user.avatar} alt="avatar" />
            </div>{" "}
            <div className="information-float__bottom">
                <div className="information-value">
                    <span className="information-value__name">
                        {" "}
                        {user.name}{" "}
                    </span>{" "}
                    <span className="information-value__gmail">
                        {" "}
                        {user.email}{" "}
                    </span>{" "}
                    <div className="information-value__address">
                        <span> Địa Chỉ: </span> <span>{user.address}</span>
                    </div>{" "}
                    <div className="information-value__phone">
                        <span> Số Điện Thoại: </span>{" "}
                        <span> {user.phone} </span>{" "}
                    </div>{" "}
                </div>{" "}
                <div className="information-btn">
                    <div className="btn__fixInfo"> Sửa thông tin </div>{" "}
                </div>{" "}
                <div className="information-btn">
                    <div className="btn__logout"> Đăng Xuất </div>{" "}
                </div>{" "}
                {/* Hiển thị danh sách thông báo */}{" "}
                <div className="notifications">
                    <h4> Thông báo: </h4>{" "}
                    <ul>
                        {" "}
                        {notifications.map((n, i) => (
                            <li key={i}> {n.message} </li>
                        ))}{" "}
                    </ul>{" "}
                </div>{" "}
            </div>{" "}
        </div>
    );
}

export default InformationFloatAdmin;
