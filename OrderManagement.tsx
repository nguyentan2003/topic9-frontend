/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { orders as initialOrders, Order, products } from './data';
import { formatCurrency, getStatusClass } from './helpers';
import { Modal } from './Modal';

export function OrderManagement() {
  const [orders] = useState<Order[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  return (
    <div className="management-page">
      <h2>Quản lý Đơn hàng</h2>
      <table>
        <thead>
          <tr>
            <th>ID Đơn hàng</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td>{formatCurrency(order.total)}</td>
              <td>
                <button onClick={() => handleViewDetails(order)} className="view-button">Xem chi tiết</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && selectedOrder && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Chi tiết đơn hàng #${selectedOrder.id}`}>
          <OrderDetail order={selectedOrder} />
        </Modal>
      )}
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
    return (
        <div className="order-details">
            <p><strong>Khách hàng:</strong> {order.customer}</p>
            <p><strong>Ngày đặt:</strong> {order.date}</p>
            <p><strong>Trạng thái:</strong> <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>
            <h4>Sản phẩm:</h4>
            <ul>
                {order.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                        <li key={item.productId}>
                            {product?.name || 'Sản phẩm không xác định'} - Số lượng: {item.quantity}
                        </li>
                    )
                })}
            </ul>
            <hr />
            <p className="total-amount"><strong>Tổng tiền:</strong> {formatCurrency(order.total)}</p>
        </div>
    );
}
