import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "./Modal";
import { formatCurrency } from "./helpers";

export interface Product {
    id: string;
    name: string;
    description: string;
    type: string;
    price: number;
    stockQuantity: number;
    reservedStock: number;
    imageUrl: string;
}

export function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const baseURL = "http://localhost:8888/api/v1/product"; // đổi thành URL API backend của bạn
    const token = localStorage.getItem("token");
    // 🚀 Fetch dữ liệu từ backend khi load trang
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${baseURL}/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProducts(res.data.result || []);
                console.log(res.data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    // ✅ Gửi dữ liệu thêm hoặc cập nhật sản phẩm
    const handleSaveProduct = async (
        formData: FormData,
        isEditing: boolean,
        id?: string
    ) => {
        try {
            if (isEditing && id) {
                await axios.put(`${baseURL}/update-product/${id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert("Sửa sản phẩm thành công");
            } else {
                const result = await axios.post(`${baseURL}/create`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Thêm sản phẩm thành công:", result.data);
                alert("Thêm sản phẩm thành công");
            }

            // reload dữ liệu sau khi cập nhật
            const res = await axios.get(`${baseURL}/list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(res.data.result || res.data);
            handleCloseModal();
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
        }
    };

    return (
        <div className="management-page">
            <div className="page-header">
                <h2>Quản lý Sản phẩm</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="add-button"
                >
                    Thêm sản phẩm
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Loại</th>
                        <th>Giá</th>
                        <th>Tồn kho</th>
                        <th>Đang giữ</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>
                                <img
                                    src={`${baseURL}/uploads/${p.imageUrl}`}
                                    alt={p.name}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                            </td>
                            <td>{p.name}</td>
                            <td>{p.type}</td>
                            <td>{formatCurrency(p.price)}</td>
                            <td>{p.stockQuantity}</td>
                            <td>{p.reservedStock}</td>
                            <td>
                                <button
                                    onClick={() => handleOpenModal(p)}
                                    className="edit-button"
                                >
                                    Sửa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingProduct ? "Chỉnh sửa" : "Thêm mới"}
                >
                    <ProductForm
                        product={editingProduct}
                        onSave={handleSaveProduct}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </div>
    );
}

// ------------------ FORM ------------------
interface ProductFormProps {
    product: Product | null;
    onSave: (formData: FormData, isEditing: boolean, id?: string) => void;
    onCancel: () => void;
}

function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: product?.name ?? "",
        description: product?.description ?? "",
        type: product?.type ?? "",
        price: product?.price ?? 0,
        stockQuantity: product?.stockQuantity ?? 0,
        reservedStock: product?.reservedStock ?? 0,
        imageFile: null as File | null,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, imageFile: file }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("type", formData.type);
        data.append("price", formData.price.toString());
        data.append("stockQuantity", formData.stockQuantity.toString());

        if (formData.imageFile) {
            data.append("image", formData.imageFile);
        }

        onSave(data, !!product, product?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label htmlFor="name">Tên sản phẩm</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label htmlFor="type">Loại</label>
                <input
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="price">Giá</label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    step="10000" // cho phép giá trị lớn hoặc có phần thập phân
                    min="0"
                    max="999999999999999999" // tùy chỉnh giới hạn cực lớn
                    value={formData.price ?? 0}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="stockQuantity">Tồn kho</label>
                <input
                    type="number"
                    id="stockQuantity"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="reservedStock">Đang giữ</label>
                <input
                    type="number"
                    id="reservedStock"
                    name="reservedStock"
                    value={formData.reservedStock}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="image">Ảnh sản phẩm</label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {product?.imageUrl && (
                    <img
                        src={`http://localhost:8888/api/v1/product/uploads/${product.imageUrl}`}
                        alt="preview"
                        style={{ width: 100, marginTop: 8, borderRadius: 6 }}
                    />
                )}
            </div>

            <div className="form-actions">
                <button type="submit" className="save-button">
                    Lưu
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="cancel-button"
                >
                    Hủy
                </button>
            </div>
        </form>
    );
}
