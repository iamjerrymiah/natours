import axios from 'axios';
import { showAlert } from './alerts';
//import keys from '../../config/keys'; 

const stripe = Stripe('pk_test_51KT1bbJDVTKMspT1AuckK1ISTASnDsCmt888Ee6aczNnC4GN0xl6kIVk7PUUKxDCGuoBSgC48PGhVp3ffzqaYwy000BCN1UYmu');
//keys.stripeKey

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id 
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};