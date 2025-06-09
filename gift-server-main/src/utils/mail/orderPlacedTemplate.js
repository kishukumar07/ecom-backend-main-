export default function generateOrderConfirmationEmail(data) {
  // Calculate subtotals for each item
  const itemsWithSubtotal = data.items.map(item => ({
    ...item,
    subtotal: item.quantity * item.price
  }));
  
  // Generate order items HTML
  const itemsHtml = itemsWithSubtotal.map(item => `
    <tr>
      <td>${item.title}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>₹${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join('');

  // Return the full HTML template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>GiftGinnie - Order Confirmation</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #ff6b88;
      padding: 20px;
      text-align: center;
    }
    .header img {
      max-width: 180px;
    }
    .content {
      padding: 30px;
    }
    h1 {
      color: #ff6b88;
      margin-top: 0;
      font-size: 24px;
    }
    .order-summary {
      margin: 20px 0;
    }
    .order-summary p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      color: #333;
    }
    .total {
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #ff6b88;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .note {
      font-size: 14px;
      color: #777;
      line-height: 1.5;
    }
    .footer {
      background-color: #f1f1f1;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.giftginnie.com/logo.png" alt="GiftGinnie Logo">
    </div>
    <div class="content">
      <h1>Order Placed Successfully!</h1>
      <p>Hello ${data.customerName},</p>
      <p>Thank you for your order! Here are your order details:</p>
      <div class="order-summary">
        <p><strong>Order ID:</strong> #GG${data.orderId}</p>
        <p><strong>Order Date:</strong> ${data.orderDate}</p>
        <p><strong>Payment Status:</strong> <span style="color: green;">${data.paymentStatus}</span></p>
        <p><strong>Shipping Address:</strong> ${data.shippingAddress}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total">
            <td colspan="3" style="text-align: right;">Total</td>
            <td>₹${data.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <p class="note">
        If you have any questions or need support, feel free to reply to this email or contact us through our website.
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} GiftGinnie. All rights reserved.</p>
      <p>123 Gift Street, Suite 100, San Francisco, CA 94107</p>
      <p>
        <a href="https://www.giftginnie.com" style="color: #ff6b88;">Our Website</a> | 
        <a href="https://www.giftginnie.com/contact" style="color: #ff6b88;">Contact Us</a> | 
        <a href="https://www.giftginnie.com/privacy" style="color: #ff6b88;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}