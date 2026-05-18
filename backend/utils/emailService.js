const nodemailer = require('nodemailer');

/**
 * Creates and returns a Nodemailer Transporter.
 * Automatically handles standard SMTP or Ethereal fallback.
 */
const getTransporter = async () => {
  // First priority: Gmail config from backend .env
  const isGmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  if (isGmailConfig) {
    console.log('[Email Service]: SMTP configured with Gmail account:', process.env.EMAIL_USER);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Second priority: Generic custom SMTP config
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Ethereal Mail for sandbox testing
  console.log('[Email Service]: SMTP configuration missing in .env. Creating test Ethereal Mail account...');
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('[Email Service Error]: Failed to construct Ethereal SMTP fallback. Creating logger-only transporter.', error.message);
    return {
      sendMail: async (mailOptions) => {
        console.log('\n=======================================');
        console.log('====== MOCK CONFIRMATION EMAIL ========');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('=======================================');
        console.log(mailOptions.text || 'HTML body printed to dev logs.');
        console.log('=======================================\n');
        return { messageId: `mock-email-${Date.now()}` };
      },
    };
  }
};

/**
 * Compiles a beautiful premium responsive HTML template for customer order confirmation
 */
const compileCustomerEmail = (order) => {
  const orderDateFormatted = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const productRows = order.products
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #dde5b6;">
        <td style="padding: 12px 8px; text-align: left; vertical-align: middle;">
          <img src="${item.product?.image || 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=200'}" alt="${item.product?.title}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid #dde5b6;" />
        </td>
        <td style="padding: 12px 8px; text-align: left; vertical-align: middle;">
          <div style="font-weight: 600; color: #6c584c; font-size: 14px;">${item.product?.title || 'Handcrafted Design'}</div>
          <div style="font-size: 11px; color: #8c9f5e; margin-top: 2px;">Qty: ${item.quantity} &times; Rs.${item.price.toFixed(2)}</div>
        </td>
        <td style="padding: 12px 8px; text-align: right; vertical-align: middle; font-weight: bold; color: #a98467; font-size: 14px;">
          Rs.${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed - Harsh Studio</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fbfaf5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #6c584c;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fbfaf5; padding: 24px 12px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-w: 600px; background-color: #f0ead2; border: 1px solid #dde5b6; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <!-- Header Banner -->
                <tr>
                  <td align="center" style="background-color: #a98467; padding: 32px 24px; color: white;">
                    <div style="width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-bottom: 12px; font-family: Georgia, serif;">H</div>
                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: normal; letter-spacing: 1px; text-transform: uppercase;">Order Confirmed</h1>
                    <p style="margin: 6px 0 0 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; tracking-wider: 0.1em;">Thank you for your purchase</p>
                  </td>
                </tr>
                
                <!-- Main Body -->
                <tr>
                  <td style="padding: 32px 24px;">
                    <p style="margin-top: 0; font-size: 14px; line-height: 1.6; font-weight: 300;">
                      Hello <strong>${order.user?.name || 'Customer'}</strong>,
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; font-weight: 300; margin-bottom: 24px;">
                      We are delighted to confirm that your order has been received and is being carefully prepared by our artisans. Below are the summary details of your secure purchase:
                    </p>
                    
                    <!-- Order Specs Table -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fbfaf5; border: 1px solid #dde5b6; border-radius: 16px; padding: 16px; margin-bottom: 28px; font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0; color: #8c9f5e; font-weight: 600;">Order ID:</td>
                        <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: #a98467;">${order.orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #8c9f5e; font-weight: 600;">Payment ID:</td>
                        <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #6c584c;">${order.paymentId || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #8c9f5e; font-weight: 600;">Order Date:</td>
                        <td style="padding: 6px 0; text-align: right; color: #6c584c;">${orderDateFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #8c9f5e; font-weight: 600;">Order Status:</td>
                        <td style="padding: 6px 0; text-align: right; color: #8c9f5e; font-weight: bold; text-transform: uppercase;">${order.orderStatus}</td>
                      </tr>
                    </table>

                    <!-- Items Header -->
                    <h3 style="font-family: Georgia, serif; font-size: 16px; font-weight: normal; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #dde5b6; color: #6c584c; text-transform: uppercase; letter-spacing: 0.5px;">Items Purchased</h3>
                    
                    <!-- Product Table -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                      ${productRows}
                      
                      <!-- Shipping Fee -->
                      <tr>
                        <td colspan="2" style="padding: 16px 8px 6px 8px; text-align: right; color: #8c9f5e; font-size: 12px;">Standard Shipping:</td>
                        <td style="padding: 16px 8px 6px 8px; text-align: right; font-weight: bold; color: #6c584c; font-size: 12px;">
                          ${order.shippingFee === 0 ? 'FREE' : `Rs.${order.shippingFee.toFixed(2)}`}
                        </td>
                      </tr>
                      <!-- Total Amount -->
                      <tr>
                        <td colspan="2" style="padding: 6px 8px; text-align: right; font-family: Georgia, serif; font-size: 15px; font-weight: bold; text-transform: uppercase; color: #6c584c;">Total Amount Paid:</td>
                        <td style="padding: 6px 8px; text-align: right; font-size: 18px; font-weight: bold; color: #a98467;">
                          Rs.${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </table>

                    <!-- Delivery & Contact Grid -->
                    <h3 style="font-family: Georgia, serif; font-size: 16px; font-weight: normal; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #dde5b6; color: #6c584c; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Destination</h3>
                    
                    <div style="background-color: #fbfaf5; border: 1px solid #dde5b6; border-radius: 16px; padding: 16px; font-size: 13px; line-height: 1.6;">
                      <div style="font-weight: bold; color: #6c584c; margin-bottom: 4px;">${order.user?.name}</div>
                      <div style="color: #6c584c; font-weight: 300;">${order.shippingAddress}</div>
                      <div style="margin-top: 8px; font-weight: 600; color: #8c9f5e;">
                        Phone: <span style="font-family: monospace; color: #6c584c; font-weight: bold;">${order.shippingPhone}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color: #fbfaf5; padding: 24px; font-size: 11px; color: #8c9f5e; border-top: 1px solid #dde5b6; font-weight: 300; line-height: 1.5;">
                    This is an automated receipt for your purchase. We wrap all pottery and fiber products using recycled carbon-neutral linens. For assistance or inquiries, please contact our support team.<br />
                    <strong>&copy; Harsh Studio Inc. All Rights Reserved.</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

/**
 * Dispatches an order confirmation email to the customer
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = await getTransporter();
    const htmlContent = compileCustomerEmail(order);

    const mailOptions = {
      from: process.env.FROM_EMAIL || (process.env.EMAIL_USER ? `"Harsh Studio" <${process.env.EMAIL_USER}>` : '"Harsh Studio" <receipts@harshstudio.com>'),
      to: order.user?.email,
      subject: `Order Confirmed! Receipt ID: ${order.orderId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Order confirmation email successfully sent to ${order.user?.email || 'customer'}. Message ID: ${info.messageId}`);
    
    // If using ethereal test account, log URL to view the output browser email
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[Email Service Ethereal]: View sent sandbox email at: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error('[Email Service Error]: Failed to dispatch order confirmation email:', error.message);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
