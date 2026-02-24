const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port from env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('--- EMAIL MOCK ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('Body:', html.substring(0, 50) + '...');
            console.log('--- EMAIL CONFIG MISSING (Skipping Send) ---');
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendWelcomeEmail = async (user) => {
    const subject = `Welcome to Arthub, ${user.name}!`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #2c3e50;">Welcome to Arthub!</h1>
            <p>Hi ${user.name},</p>
            <p>Thank you for joining our community of art lovers and creators.</p>
            <p>You can now explore thousands of unique artworks or start selling your own.</p>
            <br>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #e67acc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Arthub</a>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

const sendOrderConfirmation = async (order, buyer, orderItems) => {
    const subject = `Order Confirmation #${order._id.toString().slice(-6).toUpperCase()}`;

    // Generate Items List HTML
    const itemsHtml = orderItems.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <strong>${item.title}</strong><br>
            Qty: ${item.quantity || 1} | Price: ₹${item.price}
        </div>
    `).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #2c3e50;">Order Confirmed!</h1>
            <p>Hi ${buyer.name},</p>
            <p>Your order has been successfully placed.</p>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${order.amount}</p>
            <hr>
            ${itemsHtml}
            <hr>
            <p>We will notify you once your items are shipped.</p>
            <p>Thank you for shopping with Arthub!</p>
        </div>
    `;
    await sendEmail(buyer.email, subject, html);
};

module.exports = { sendWelcomeEmail, sendOrderConfirmation };
