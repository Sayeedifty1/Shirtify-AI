import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Customizer from "./pages/Customizer";
import Home from "./pages/Home";
import Canvas from "./canvas";

// Load your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
