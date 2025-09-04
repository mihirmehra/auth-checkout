// app/page.js
"use client";

import { useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cardCode: '',
    amount: '10.00',
  });
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAcceptJsLoaded, setIsAcceptJsLoaded] = useState(false); // New state to track script loading
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePayment = (e) => {
    e.preventDefault();

    if (!isAcceptJsLoaded) {
      setMessage('Payment libraries are still loading. Please wait a moment.');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Processing your payment...');

    var authData = {
      clientKey: process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY,
      apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID,
    };

    var cardData = {
      cardNumber: formData.cardNumber,
      month: formData.expMonth,
      year: formData.expYear,
      cardCode: formData.cardCode,
    };

    var secureData = {
      cardData: cardData
    };
    
    window.Accept.dispatchData(authData, secureData, responseHandler);
  };

  const responseHandler = (response) => {
    setIsProcessing(false);
    if (response.messages.resultCode === "Error") {
      const errorMsg = response.messages.message[0].text;
      setMessage(`Error: ${errorMsg}`);
    } else {
      const paymentNonce = response.opaqueData.dataValue;
      
      axios.post('/api/process-payment', {
        paymentNonce: paymentNonce,
        amount: formData.amount,
      })
      .then(res => {
        setMessage('Payment successful! Redirecting to invoice...');
        const invoiceId = res.data.invoiceId;
        router.push(`/invoice/${invoiceId}`);
      })
      .catch(err => {
        setMessage('Payment failed on the server. Please try again.');
        console.error(err.response ? err.response.data : err.message);
      });
    }
  };

  return (
    <>
      <Head>
        <title>Checkout - Authorize.net</title>
      </Head>
      
      {/* Load AcceptCore.js and then Accept.js. Use onLoad to know when it's ready. */}
      <Script 
        src="https://jstest.authorize.net/v1/AcceptCore.js" 
        strategy="beforeInteractive" 
      />
      <Script 
        src="https://jstest.authorize.net/v1/Accept.js" 
        strategy="beforeInteractive" 
        onLoad={() => setIsAcceptJsLoaded(true)} // Set state when loaded
      />

      <div className="container">
        <h1>Custom Authorize.net Checkout</h1>
        <form onSubmit={handlePayment}>
          <div>
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="XXXX XXXX XXXX XXXX"
              required
            />
          </div>
          <div>
            <label htmlFor="expMonth">Expiration Month</label>
            <input
              type="text"
              id="expMonth"
              name="expMonth"
              value={formData.expMonth}
              onChange={handleInputChange}
              placeholder="MM"
              required
            />
          </div>
          <div>
            <label htmlFor="expYear">Expiration Year</label>
            <input
              type="text"
              id="expYear"
              name="expYear"
              value={formData.expYear}
              onChange={handleInputChange}
              placeholder="YYYY"
              required
            />
          </div>
          <div>
            <label htmlFor="cardCode">CVV</label>
            <input
              type="text"
              id="cardCode"
              name="cardCode"
              value={formData.cardCode}
              onChange={handleInputChange}
              placeholder="XXX"
              required
            />
          </div>
          <div>
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              required
            />
          </div>
          <button type="submit" disabled={isProcessing || !isAcceptJsLoaded}>
            {isProcessing ? 'Processing...' : (isAcceptJsLoaded ? 'Pay Now' : 'Loading...')}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </>
  );
}