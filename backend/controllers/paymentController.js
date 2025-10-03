const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Session = require('../models/Session');

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { sessionId, amount } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `session_${sessionId}`,
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      session: sessionId,
      amount,
      razorpayOrderId: order.id,
      status: 'created'
    });

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        sessionId: sessionId,
        paymentId: payment._id
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValid = generatedSignature === razorpaySignature;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (!isValid) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'completed';
    await payment.save();

    // Update session payment status
    const session = await Session.findById(payment.session);
    if (session) {
      session.paymentStatus = 'completed';
      session.paymentId = payment._id;
      await session.save();
    }

    return res.json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, verifyPayment };
