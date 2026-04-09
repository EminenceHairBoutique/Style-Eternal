// src/pages/Cancel.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function Cancel() {
  return (
    <>
      <SEO title="Payment Cancelled — Style Eternal" description="Your payment was cancelled." />
      <div className="bg-se-black text-se-bone min-h-[70vh] pt-32 pb-24 text-center">
        <div className="content-wide">
          <p className="text-overline mb-4">Checkout</p>
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] tracking-[0.04em] mb-6">
            PAYMENT CANCELLED
          </h1>
          <p className="text-[15px] text-se-bone/40 max-w-md mx-auto mb-10">
            Your payment was not completed. Your items are still in your bag.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/checkout" className="btn-primary">Return to Checkout</Link>
            <Link to="/shop" className="btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </>
  );
}
