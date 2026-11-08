export function generateReceiptHtml(order) {
  const orderId = order.orderId || `ME-${String(order.id).padStart(6, '0')}`
  const orderDate = order.orderDate || new Date().toLocaleString('en-IN')
  const customerName = order.customerName || 'Valued Customer'
  const phone = order.phone || 'N/A'
  const address = order.deliveryAddress || 'Address on file'
  const subtotal = Number(order.subtotal || order.totalAmount || 0).toFixed(2)
  const gst = Number(order.gstAmount || (order.subtotal ? order.subtotal * 0.05 : 0)).toFixed(2)
  const delivery = Number(order.deliveryFee || 0).toFixed(2)
  const total = Number(order.totalAmount || 0).toFixed(2)
  const items = order.items || []

  const itemsRows = items.map((it, idx) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${it.foodName}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${it.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs.${Number(it.price || 0).toFixed(2)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">Rs.${Number(it.subtotal || (it.price * it.quantity)).toFixed(2)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MAD EATS Restaurant Order Receipt - ${orderId}</title>
  <style>
    html, body, div, p, span, table, tr, td, th { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background: #f8fafc; padding: 24px; color: #1e293b; }
    .invoice-card { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06); padding: 36px; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e63946; padding-bottom: 20px; margin-bottom: 24px; }
    .logo-box h1 { font-size: 28px; font-weight: 900; color: #e63946; letter-spacing: -0.5px; }
    .logo-box p { font-size: 13px; font-weight: 700; color: #334155; margin-top: 4px; }
    .invoice-badge-box { text-align: right; }
    .invoice-pill { background: #fee2e2; color: #e63946; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; display: inline-block; text-transform: uppercase; }
    .order-id-txt { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 6px; }
    .date-txt { font-size: 12px; color: #64748b; margin-top: 2px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #fbfbfa; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .meta-col h4 { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; margin-bottom: 6px; }
    .meta-col p { font-size: 14px; color: #0f172a; line-height: 1.4; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table th { background: #f1f5f9; padding: 10px 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .summary-box { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .summary-table { width: 300px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #475569; }
    .summary-row.total-row { border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 6px; font-size: 18px; font-weight: 900; color: #e63946; }
    .footer-note { text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 18px; font-size: 13px; color: #64748b; }
    .footer-note strong { color: #e63946; font-size: 14px; }
    @media print {
      body { background: white; padding: 0; }
      .invoice-card { box-shadow: none; border: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header-row">
      <div class="logo-box">
        <h1>MAD EATS</h1>
        <p>Restaurant Order Receipt</p>
      </div>
      <div class="invoice-badge-box">
        <span class="invoice-pill">Payment: CASH ON DELIVERY</span>
        <div class="order-id-txt">${orderId}</div>
        <div class="date-txt">${orderDate}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-col">
        <h4>Customer Details</h4>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Mobile:</strong> ${phone}</p>
        <p><strong>Payment Method:</strong> CASH ON DELIVERY</p>
      </div>
      <div class="meta-col">
        <h4>Delivery Address</h4>
        <p>${address}</p>
        <p style="margin-top: 4px; font-size: 12px; color: #64748b;"><strong>Order Status:</strong> ${order.orderStatus || 'PLACED'}</p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45px; text-align: center;">#</th>
          <th style="text-align: left;">Food Item Name</th>
          <th style="width: 60px; text-align: center;">Quantity</th>
          <th style="width: 90px; text-align: right;">Price</th>
          <th style="width: 100px; text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-table">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>Rs.${subtotal}</span>
        </div>
        <div class="summary-row">
          <span>GST (5%)</span>
          <span>Rs.${gst}</span>
        </div>
        <div class="summary-row">
          <span>Delivery Charges</span>
          <span>${delivery === '0.00' ? 'FREE' : 'Rs.' + delivery}</span>
        </div>
        <div class="summary-row">
          <span>Discount</span>
          <span>Rs.0.00</span>
        </div>
        <div class="summary-row total-row">
          <span>Grand Total</span>
          <span>Rs.${total}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p><strong>Thank you for ordering with MAD EATS!</strong></p>
      <p style="margin-top: 6px;">Payment Method: CASH ON DELIVERY. Keep exact cash ready upon delivery.</p>
    </div>
  </div>
</body>
</html>`
}

export function downloadOrderReceipt(order) {
  const htmlContent = generateReceiptHtml(order)
  const orderId = order.orderId || `ME-${String(order.id).padStart(6, '0')}`

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 450)
  }

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `MAD_EATS_Receipt_${orderId}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
