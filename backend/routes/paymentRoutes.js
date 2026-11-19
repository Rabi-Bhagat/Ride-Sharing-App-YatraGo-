const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Lazy-initialized Razorpay instance
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret
  });
}

// 0. GET CONFIG (Expose Public Key ID only, never secret)
router.get('/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  res.json({
    success: true,
    key_id: keyId
  });
});

// 1. CREATE ORDER (POST /api/create-order or /api/payment/create-order)
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate amount (in paise, integer)
    const numericAmount = Math.round(Number(amount));
    if (!numericAmount || isNaN(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be a valid number in paise.'
      });
    }

    // Minimum amount: 100 paise (₹1.00)
    if (numericAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least 100 paise (₹1.00).'
      });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(401).json({
        success: false,
        message: 'Razorpay API credentials not configured on the server.'
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize Razorpay SDK client.'
      });
    }

    const orderOptions = {
      amount: numericAmount,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: notes || { platform: 'YatraGo Ride Sharing' }
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: key_id
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);

    // Razorpay error response handling
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.error?.description || error.message || 'Error creating Razorpay order.',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// 2. VERIFY PAYMENT SIGNATURE (POST /api/verify-payment or /api/payment/verify-payment)
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      rideId,
      riderName
    } = req.body;

    // Validate missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.'
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: 'Server Razorpay secret is not configured.'
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    // Constant-time signature comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(String(razorpay_signature), 'utf8');

    const isSignatureValid = 
      expectedBuf.length === receivedBuf.length && 
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. Payment has not been marked as paid.'
      });
    }

    // Update ride cost share in MongoDB if rideId provided
    if (rideId) {
      try {
        const Ride = require('../models/Ride');
        const ride = await Ride.findById(rideId);
        if (ride && ride.costSplits) {
          const split = ride.costSplits.find(s => s.riderName === riderName);
          if (split) {
            split.status = 'Paid';
            split.paymentId = razorpay_payment_id;
            await ride.save();
          }
        }
      } catch (dbErr) {
        console.warn('Note: Could not sync payment to MongoDB ride record:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Ride fare settled.',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (error) {
    console.error('Razorpay Signature Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while verifying payment signature.'
    });
  }
});

module.exports = router;
