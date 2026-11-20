/**
 * Razorpay Standard Web Checkout Integration for YatraGo
 * 
 * Handles order creation on backend (/api/create-order),
 * opens Razorpay standard modal, and verifies HMAC-SHA256 signature
 * on backend (/api/verify-payment).
 */

// Helper to ensure Razorpay SDK script is loaded
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Standard Checkout
 * 
 * @param {Object} params
 * @param {number} params.amountInRupees - Total in INR (e.g. 180 or 240.50)
 * @param {string} [params.riderName] - Passenger / Customer Name
 * @param {string} [params.riderEmail] - Customer Email
 * @param {string} [params.riderPhone] - Customer Contact
 * @param {string} [params.description] - Purpose of payment
 * @param {string} [params.rideId] - Optional Ride ID for database sync
 * @param {Function} params.onSuccess - Callback receiving verifyData and razorpayResponse
 * @param {Function} params.onFailure - Callback receiving error message
 * @param {Function} [params.onDismiss] - Callback when user closes payment modal
 */
export async function openRazorpayCheckout({
  amountInRupees,
  riderName = 'Alex Rivera',
  riderEmail = 'alex.rivera@yatrago.com',
  riderPhone = '+91 98765 43210',
  description = 'YatraGo Ride Fare Settlement',
  rideId = 'ride_101',
  onSuccess,
  onFailure,
  onDismiss
}) {
  try {
    // 1. Ensure Razorpay checkout script is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    // Convert amount in Rupees to Paise (minimum 100 paise = ₹1.00)
    const amountInRupeesNumber = Number(amountInRupees);
    if (!Number.isFinite(amountInRupeesNumber) || amountInRupeesNumber <= 0) {
      throw new Error('Invalid payment amount. Please check the fare and try again.');
    }
    const amountInPaise = Math.max(100, Math.round(amountInRupeesNumber * 100));

    // 2. Call Backend API to create an order
    const orderResponse = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: {
          riderName,
          rideId,
          description
        }
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok || !orderData.success) {
      throw new Error(orderData.message || 'Failed to initialize Razorpay order.');
    }

    // 3. Configure Razorpay Standard Modal
    const keyId = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    if (!keyId) {
      throw new Error('Razorpay public key is not configured. Please contact support.');
    }

    // Ensure clean 10-digit Indian mobile number for Razorpay domestic methods (UPI, RuPay, Netbanking)
    let cleanContact = String(riderPhone || '').replace(/\D/g, '');
    if (cleanContact.length < 10 || cleanContact.startsWith('1')) {
      cleanContact = '9876543210';
    } else if (cleanContact.length === 12 && cleanContact.startsWith('91')) {
      cleanContact = cleanContact.slice(2);
    }

    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'YatraGo Mobility',
      description: description || `Fare Settlement for ${riderName}`,
      image: '/yatrago-logo.png',
      order_id: orderData.order_id,
      prefill: {
        name: riderName || 'Alex Rivera',
        email: riderEmail || 'alex.rivera@yatrago.com',
        contact: cleanContact
      },
      notes: {
        rideId,
        passenger: riderName
      },
      theme: {
        color: '#06b6d4', // Cyan brand accent
        backdrop_color: 'rgba(2, 6, 23, 0.85)'
      },
      modal: {
        confirm_close: true,
        ondismiss: function () {
          if (onDismiss) onDismiss();
        }
      },
      handler: async function (razorpayResponse) {
        // razorpayResponse contains:
        // - razorpay_payment_id
        // - razorpay_order_id
        // - razorpay_signature

        try {
          // 4. Send payment details & signature to backend for verification
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              rideId,
              riderName
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.success) {
            if (onSuccess) {
              onSuccess(verifyData, razorpayResponse);
            }
          } else {
            const errorMsg = verifyData.message || 'Payment signature verification failed.';
            if (onFailure) onFailure(errorMsg);
          }
        } catch (verifyError) {
          console.error('Verification Request Error:', verifyError);
          if (onFailure) onFailure(verifyError.message || 'Network error verifying payment.');
        }
      }
    };

    const rzp = new window.Razorpay(options);

    // Handle payment failure event
    rzp.on('payment.failed', function (failedResponse) {
      console.warn('Razorpay Payment Failed:', failedResponse.error);
      const reason = failedResponse.error?.description || failedResponse.error?.reason || 'Payment could not be completed.';
      if (onFailure) {
        onFailure(reason, failedResponse.error);
      }
    });

    // Open Razorpay Standard Checkout Window
    rzp.open();

  } catch (error) {
    console.error('Razorpay Checkout Error:', error);
    if (onFailure) {
      onFailure(error.message || 'Failed to open Razorpay payment gateway.');
    }
  }
}
