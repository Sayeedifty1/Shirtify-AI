
import "./payment.css";

// PaymentForm.js

import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

const PaymentForm = ({ paymentAmount, onSubmit, onCancel, onComplete }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [isProcessing, setIsProcessing] = useState(false);

    const handlePaymentSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded or failed to load.
            return;
        }

        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);

        try {
            // Create a PaymentMethod with the card information
            const paymentMethodResult = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
            });

            if (paymentMethodResult.error) {
                console.error(paymentMethodResult.error.message);
                setIsProcessing(false);
                return;
            }

            // Submit the payment to your server
            const { paymentMethod } = paymentMethodResult;
            onSubmit(paymentMethod.id, paymentAmount, onComplete); // Call the parent component's handlePayment function
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };


    return (
        <div className="modal active ">
            <div className="modal-content">
                <h2 className="text-2xl mb-8">Total Amount: ${paymentAmount}</h2>
                <form onSubmit={handlePaymentSubmit}>
                    <div className="form-row mb-10">
                    <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
                    </div>
                    <div className="flex justify-evenly">
                        <button type="submit" className="bg-green-600 p-2 rounded-lg text-white" disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Pay Now"}
                        </button>
                        <button className="bg-red-600 p-2 rounded-lg text-white" type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
