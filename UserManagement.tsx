import React, { useEffect, useState } from "react";
import "./UserManagement.css";
export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: "USER",
    });

    // 🔹 Gọi API để lấy dữ liệu người dùng
    useEffect(() => {
        const token = localStorage.getItem("token"); // Lấy token

        fetch("http://localhost:8888/api/v1/identity/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // ✅ thêm token ở đây
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);

                if (data.code === 1000) {
                    // Nếu result là mảng thì dùng luôn, còn nếu là object thì bọc vào mảng
                    const result = Array.isArray(data.result)
                        ? data.result
                        : [data.result];
                    setUsers(result);
                }
            })
            .catch((err) => console.error("API error:", err));
    }, []);

    // 🔹 Mở modal (thêm hoặc sửa)
    const handleOpen = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                role: user.roles[0]?.name || "USER",
            });
        } else {
            setEditingUser(null);
            setFormData({ fullName: "", email: "", role: "USER" });
        }
        setIsOpen(true);
    };

    // 🔹 Đóng modal
    const handleClose = () => {
        setIsOpen(false);
        setEditingUser(null);
    };

    // 🔹 Lưu người dùng
    const handleSave = () => {
        if (editingUser) {
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === editingUser.id
                        ? {
                              ...u,
                              fullName: formData.fullName,
                              email: formData.email,
                              roles: [
                                  {
                                      name: formData.role,
                                      description: "",
                                      permissions: [],
                                  },
                              ],
                          }
                        : u
                )
            );
        } else {
            const newUser = {
                id: Date.now().toString(),
                username: formData.email.split("@")[0],
                fullName: formData.fullName,
                email: formData.email,
                phone: "",
                address: "",
                roles: [
                    { name: formData.role, description: "", permissions: [] },
                ],
            };
            setUsers((prev) => [...prev, newUser]);
        }
        handleClose();
    };

    // 🔹 Xóa người dùng
    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
            setUsers(users.filter((u) => u.id !== id));
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h2>Quản lý người dùng</h2>
                <button className="btn btn-add" onClick={() => handleOpen()}>
                    + Thêm người dùng
                </button>
            </div>

            <table className="user-table">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.roles?.[0]?.name ||
                                        "Không có vai trò"}
                                </td>

                                <td>
                                    <button
                                        className="btn btn-edit"
                                        onClick={() => handleOpen(user)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-delete"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="no-data">
                                Không có người dùng nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal */}
            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>
                            {editingUser
                                ? "Chỉnh sửa người dùng"
                                : "Thêm người dùng mới"}
                        </h3>

                        <div className="form-group">
                            <label>Tên</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fullName: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Vai trò</label>
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.value,
                                    })
                                }
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="USER">User</option>
                                <option value="EDITOR">Editor</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-cancel"
                                onClick={handleClose}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-save"
                                onClick={handleSave}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
