/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import './AdminPage.css';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { UserManagement } from './UserManagement';
import { DeliveryManagement } from './DeliveryManagement';
import { Dashboard } from './Dashboard';

type View = 'dashboard' | 'products' | 'orders' | 'users' | 'delivery';

export function AdminPage() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      case 'delivery':
        return <DeliveryManagement />;
      default:
        return <Dashboard />;
    }
  };

  const NavLink = ({ view, label }: { view: View; label: string }) => (
    <li>
      <button
        onClick={() => setCurrentView(view)}
        className={currentView === view ? 'active' : ''}
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
            <NavLink view="dashboard" label="Tổng quan" />
            <NavLink view="products" label="Sản phẩm" />
            <NavLink view="orders" label="Đơn hàng" />
            <NavLink view="users" label="Người dùng" />
            <NavLink view="delivery" label="Giao hàng" />
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}