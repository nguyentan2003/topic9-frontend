/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { orders } from './data';
import { formatCurrency, getStatusClass } from './helpers';

const StatCard = ({ value, label }: { value: string | number, label: string }) => (
    <div className="stat-card">
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-label">{label}</p>
    </div>
);

export function Dashboard() {
    // Helper to get today's date in YYYY-MM-DD format
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };
    
    // Helper to get current month and year
    const getCurrentMonthYear = () => {
        const today = new Date();
        return {
            month: today.getMonth() + 1,
            year: today.getFullYear()
        };
    }

    const todayString = getTodayString();
    const { month, year } = getCurrentMonthYear();

    // Filter orders for today
    const todaysOrders = orders.filter(order => order.date === todayString);
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);

    // Filter orders for this month
    const thisMonthsOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() + 1 === month && orderDate.getFullYear() === year;
    });
    const thisMonthsRevenue = thisMonthsOrders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Tổng quan</h2>
            </div>
            <div className="stat-cards">
                <StatCard value={formatCurrency(todaysRevenue)} label="Doanh thu hôm nay" />
                <StatCard value={todaysOrders.length} label="Đơn hàng hôm nay" />
                <StatCard value={formatCurrency(thisMonthsRevenue)} label="Doanh thu tháng này" />
                <StatCard value={thisMonthsOrders.length} label="Đơn hàng tháng này" />
            </div>

            <div className="recent-orders">
                <h3>Đơn hàng hôm nay</h3>
                {todaysOrders.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>ID Đơn hàng</th>
                                <th>Khách hàng</th>
                                <th>Trạng thái</th>
                                <th>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todaysOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(order.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Không có đơn hàng nào hôm nay.</p>
                )}
            </div>
        </div>
    );
}