export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export const generateQuotationNumber = (prefix = 'DIO-QT', count = 0) => {
  const year = new Date().getFullYear()
  const nextNum = (count + 1).toString().padStart(4, '0')
  return `${prefix}-${year}-${nextNum}`
}

export const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'draft': return { text: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.1)', border: 'rgba(161, 161, 170, 0.2)' }
    case 'pending approval': return { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)' }
    case 'approved': return { text: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)' }
    case 'sent': return { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' }
    case 'accepted': return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' }
    case 'rejected': return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' }
    case 'expired': return { text: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)' }
    case 'cancelled': return { text: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', border: 'rgba(113, 113, 122, 0.2)' }
    case 'completed': return { text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.2)' }
    default: return { text: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.1)', border: 'rgba(161, 161, 170, 0.2)' }
  }
}

export const calculateLineItemTotal = (item) => {
  const subtotal = (item.quantity || 0) * (item.unit_price || 0)
  let discount = 0
  if (item.discount_type === 'percentage') {
    discount = subtotal * ((item.discount_value || 0) / 100)
  } else {
    discount = item.discount_value || 0
  }
  const afterDiscount = Math.max(0, subtotal - discount)
  const tax = afterDiscount * ((item.tax_rate || 0) / 100)
  return afterDiscount + tax
}

export const calculateQuotationTotals = (items, taxRate = 16, globalDiscountType = 'percentage', globalDiscountValue = 0, shipping = 0, labour = 0, transport = 0, otherCharges = 0) => {
  let subtotal = 0
  items.forEach(item => {
    subtotal += calculateLineItemTotal(item)
  })

  let discountAmount = 0
  if (globalDiscountType === 'percentage') {
    discountAmount = subtotal * (globalDiscountValue / 100)
  } else {
    discountAmount = globalDiscountValue
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const taxAmount = afterDiscount * (taxRate / 100)
  
  const grandTotal = afterDiscount + taxAmount + Number(shipping) + Number(labour) + Number(transport) + Number(otherCharges)

  return {
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal
  }
}
