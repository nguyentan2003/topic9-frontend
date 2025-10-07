/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const getStatusClass = (status?: string): string => {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
}
