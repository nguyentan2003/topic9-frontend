/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { users as initialUsers, User } from './data';
import { Modal } from './Modal';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      const newUser = { ...user, id: Date.now() };
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Quản lý Người dùng</h2>
        <button onClick={() => handleOpenModal()} className="add-button">Thêm người dùng</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
              <td>
                <button onClick={() => handleOpenModal(user)} className="edit-button">Sửa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}>
          <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCloseModal} />
        </Modal>
      )}
    </div>
  );
}

interface UserFormProps {
    user: User | null;
    onSave: (user: User) => void;
    onCancel: () => void;
}

function UserForm({ user, onSave, onCancel }: UserFormProps) {
    const [formData, setFormData] = useState<Omit<User, 'id'>>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'viewer',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...(user || {id: 0}), ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label htmlFor="name">Tên</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="role">Vai trò</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                </select>
            </div>
            <div className="form-actions">
                <button type="submit" className="save-button">Lưu</button>
                <button type="button" onClick={onCancel} className="cancel-button">Hủy</button>
            </div>
        </form>
    );
}
