/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { deliveryStatuses as initialData, DeliveryStatus } from './data';
import { Modal } from './Modal';
import { getStatusClass } from './helpers';

export function DeliveryManagement() {
  const [statuses, setStatuses] = useState<DeliveryStatus[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<DeliveryStatus | null>(null);

  const handleOpenModal = (status: DeliveryStatus | null = null) => {
    setEditingStatus(status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingStatus(null);
    setIsModalOpen(false);
  };

  const handleSaveStatus = (status: DeliveryStatus) => {
    if (editingStatus) {
      setStatuses(statuses.map(s => s.id === status.id ? status : s));
    } else {
      const newStatus = { ...status, id: `track-${Date.now()}` };
      setStatuses([...statuses, newStatus]);
    }
    handleCloseModal();
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Quản lý Giao hàng</h2>
        <button onClick={() => handleOpenModal()} className="add-button">Thêm trạng thái</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID Đơn hàng</th>
            <th>Mã vận đơn</th>
            <th>Trạng thái</th>
            <th>Vị trí hiện tại</th>
            <th>Ngày gửi</th>
            <th>Ngày giao</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map(status => (
            <tr key={status.id}>
              <td>{status.order_id}</td>
              <td>{status.tracking_number || 'N/A'}</td>
              <td>
                <span className={`status-badge ${getStatusClass(status.status)}`}>
                  {status.status.replace('_', ' ')}
                </span>
              </td>
              <td>{status.current_position}</td>
              <td>{status.shipping_date || 'N/A'}</td>
              <td>{status.delivery_date || 'N/A'}</td>
              <td>
                <button onClick={() => handleOpenModal(status)} className="edit-button">Sửa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStatus ? 'Cập nhật trạng thái' : 'Thêm trạng thái giao hàng'}>
          <DeliveryForm status={editingStatus} onSave={handleSaveStatus} onCancel={handleCloseModal} />
        </Modal>
      )}
    </div>
  );
}

interface DeliveryFormProps {
    status: DeliveryStatus | null;
    onSave: (status: DeliveryStatus) => void;
    onCancel: () => void;
}

function DeliveryForm({ status, onSave, onCancel }: DeliveryFormProps) {
    const [formData, setFormData] = useState<Omit<DeliveryStatus, 'id'>>({
        order_id: status?.order_id ?? 0,
        tracking_number: status?.tracking_number ?? '',
        status: status?.status ?? 'processing',
        shipping_date: status?.shipping_date ?? '',
        delivery_date: status?.delivery_date ?? '',
        current_position: status?.current_position ?? '',
        address: status?.address ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...(status || {id: ''}), ...formData });
    };



    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label htmlFor="order_id">ID Đơn hàng</label>
                <input type="number" id="order_id" name="order_id" value={formData.order_id} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="tracking_number">Mã vận đơn</label>
                <input type="text" id="tracking_number" name="tracking_number" value={formData.tracking_number} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="current_position">Vị trí hiện tại</label>
                <input type="text" id="current_position" name="current_position" value={formData.current_position} onChange={handleChange} required />
            </div>
             <div className="form-group">
                <label htmlFor="shipping_date">Ngày gửi hàng (YYYY-MM-DD)</label>
                <input type="text" id="shipping_date" name="shipping_date" value={formData.shipping_date} onChange={handleChange} />
            </div>
             <div className="form-group">
                <label htmlFor="delivery_date">Ngày giao hàng (YYYY-MM-DD)</label>
                <input type="text" id="delivery_date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} />
            </div>
            <div className="form-actions">
                <button type="submit" className="save-button">Lưu</button>
                <button type="button" onClick={onCancel} className="cancel-button">Hủy</button>
            </div>
        </form>
    );
}
