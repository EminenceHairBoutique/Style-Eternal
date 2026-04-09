// src/pages/NotFound.jsx — Style Eternal
import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" description="This page doesn't exist." noindex={true} />
      <div className="min-h-[70vh] bg-se-black text-se-bone pt-32 pb-24">
        <div className="content-wide text-center">
          <p className="text-overline mb-4">404</p>
          <h1 className="font-display text-[clamp(2rem,6vw,4rem)] tracking-[0.04em] mb-6">
            PAGE NOT FOUND
          </h1>
          <p className="text-[15px] text-se-bone/40 max-w-md mx-auto mb-10">
            The link you followed may be outdated, or the page has been moved.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/shop" className="btn-primary">Shop</Link>
            <Link to="/collections" className="btn-outline">Collections</Link>
            <Link to="/" className="btn-outline">Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}
