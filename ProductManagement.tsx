/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { products as initialProducts, Product } from './data';
import { formatCurrency } from './helpers';
import { Modal } from './Modal';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      const newProduct = { ...product, id: Date.now() };
      setProducts([...products, newProduct]);
    }
    handleCloseModal();
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Quản lý Sản phẩm</h2>
        <button onClick={() => handleOpenModal()} className="add-button">Thêm sản phẩm</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{formatCurrency(product.price)}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => handleOpenModal(product)} className="edit-button">Sửa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}>
          <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={handleCloseModal} />
        </Modal>
      )}
    </div>
  );
}

interface ProductFormProps {
    product: Product | null;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: product?.name ?? '',
        category: product?.category ?? '',
        price: product?.price ?? 0,
        stock: product?.stock ?? 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...(product || {id: 0}), ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label htmlFor="name">Tên sản phẩm</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="price">Giá</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="stock">Tồn kho</label>
                <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required />
            </div>
            <div className="form-actions">
                <button type="submit" className="save-button">Lưu</button>
                <button type="button" onClick={onCancel} className="cancel-button">Hủy</button>
            </div>
        </form>
    );
}