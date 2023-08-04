import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Customizer from "./pages/Customizer";
import Home from "./pages/Home";
import Canvas from "./canvas";

// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51NEJ3lC34UbiWIDZIas8ov9660fBALb7SZsOC7uGKMFMYp3lJNuxabtxb3VlfQFEqH8jFyo3cjye7zmJIMXRvlii00F1GRE84A');

function App() {
  return (
    <main className="app transition-all ease-in">
      <Home />
      <Canvas />
      <Elements stripe={stripePromise}>
        <Customizer />
      </Elements>
    </main>
  );
}

export default App;
