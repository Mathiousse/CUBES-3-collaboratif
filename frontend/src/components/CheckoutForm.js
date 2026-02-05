import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/CheckoutForm.css';

function CheckoutForm({ clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      setError(result.error.message);
      setProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="card-element-wrapper">
        <CardElement options={cardStyle} />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Annuler
        </button>
        <button type="submit" disabled={!stripe || processing} className="pay-btn">
          {processing ? 'Traitement...' : 'Payer maintenant'}
        </button>
      </div>
      <p className="test-card-info">
        Carte de test: 4242 4242 4242 4242 | Date future | 3 chiffres
      </p>
    </form>
  );
}

export default CheckoutForm;

