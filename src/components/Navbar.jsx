import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, User, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { BRAND } from "../config/brand";
import SearchModal from "./SearchModal";

export default function Navbar() {
  const { items, openCart } = useCart();
  const { user } = useUser();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  // Close on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = useMemo(() => [
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Shop", href: "/shop" },
    { label: "Drops", href: "/drops" },
    { label: "Collections", href: "/collections" },
    { label: "Editorial", href: "/editorial" },
    { label: "About", href: "/about" },
  ], []);

  const mobileLinks = useMemo(() => [
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Shop All", href: "/shop" },
    { label: "Tees", href: "/shop/tees" },
    { label: "Hoodies", href: "/shop/hoodies" },
    { label: "Outerwear", href: "/shop/outerwear" },
    { label: "Bottoms", href: "/shop/bottoms" },
    { label: "Headwear", href: "/shop/headwear" },
    { label: "Accessories", href: "/shop/accessories" },
    { divider: true },
    { label: "Drops", href: "/drops" },
    { label: "Collections", href: "/collections" },
    { label: "Editorial", href: "/editorial" },
    { label: "Community", href: "/community" },
    { label: "About", href: "/about" },
    { divider: true },
    { label: "Account", href: "/account" },
    { label: "Rewards", href: "/rewards" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faqs" },
    { label: "Shipping", href: "/shipping" },
    { label: "Size Guide", href: "/size-guide" },
  ], []);

  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-se-black/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-se-bone text-se-black text-center py-1.5">
          <p className="text-label text-[9px] tracking-[0.25em]">
            Free shipping on orders over $150 — Born in Newark, shipped worldwide
          </p>
        </div>

        {/* Main Nav */}
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-2"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-se-bone" />
          </button>

          {/* Brand */}
          <Link to="/" className="flex flex-col items-center leading-none">
            <span className="font-display text-[18px] md:text-[20px] tracking-[0.15em] text-se-bone font-semibold">
              {BRAND.name.toUpperCase()}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-accent text-se-bone/70">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="link-hover hover:text-se-bone transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-white/5 transition"
              aria-label="Search"
            >
              <Search size={18} className="text-se-bone/70" />
            </button>

            <Link
              to="/account"
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-white/5 transition"
              aria-label={user ? "My account" : "Sign in"}
            >
              <User size={18} className="text-se-bone/70" />
            </Link>

            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-white/5 transition"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} className="text-se-bone/70" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-se-gold text-se-black text-[9px] font-accent font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-[360px] bg-se-charcoal overflow-y-auto animate-dropdown-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <span className="font-display text-[16px] tracking-[0.15em] text-se-bone font-semibold">
                {BRAND.name.toUpperCase()}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 -mr-2"
                aria-label="Close menu"
              >
                <X size={20} className="text-se-bone/70" />
              </button>
            </div>

            {/* Links */}
            <nav className="p-6 space-y-1">
              {mobileLinks.map((link, i) =>
                link.divider ? (
                  <hr key={`div-${i}`} className="divider my-4" />
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center justify-between py-3 text-[13px] tracking-[0.1em] uppercase font-accent text-se-bone/80 hover:text-se-bone transition"
                  >
                    {link.label}
                    <ChevronRight size={14} className="text-se-steel" />
                  </Link>
                )
              )}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-white/5">
              <p className="text-[10px] text-se-steel tracking-[0.15em] uppercase">
                {BRAND.origin}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
