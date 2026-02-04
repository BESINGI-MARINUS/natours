/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';
import Stripe from 'stripe';

let stripe;
if (Stripe)
  stripe = Stripe(
    'pk_test_51SCceP2EVZexQnETpywwYd5Qnz4kpYlvcWwWYa6zXzo59PwHJ87fn91st8j8scXSl0PDxcV3XEMd4TRiz8fex3UZ00BWA5sBuj',
  );

export const bookTour = async (tourId) => {
  try {
    // 1. Get session from API
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    // // 2. Create checkout form and charge card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
