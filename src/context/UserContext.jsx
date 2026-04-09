import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";


const UserContext = createContext();

/* =========================
   Base User Shape
========================= */

const EMPTY_USER = {
  id: null,
  name: "",
  email: "",
  phone: "",
  // Account access tier (separate from loyalty tiers)
  // - customer (default)
  // - partner_pending
  // - partner
  accountTier: "customer",
  partnerStatus: "none",
  partnerTier: null,
  loyaltyPoints: 0,
  orders: [],
  wishlist: [],
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
  referrals: {
    code: "",
    referredCount: 0,
    rewardBalance: 0,
  },
  createdAt: null,
};

/* =========================
   Helpers
========================= */

const generateReferralCode = (idOrEmail = "") => {
  const base =
    idOrEmail.replace(/[^A-Za-z0-9]/g, "").slice(-5).toUpperCase() ||
    Date.now().toString().slice(-5);
  return `SE-${base}`;
};

const hydrateUser = (raw) => {
  if (!raw) return null;

  const mergedAddress = {
    ...EMPTY_USER.address,
    ...(raw.address || {}),
  };

  const mergedReferrals = {
    ...EMPTY_USER.referrals,
    ...(raw.referrals || {}),
  };

  if (!mergedReferrals.code) {
    mergedReferrals.code = generateReferralCode(raw.id || raw.email || "");
  }

  return {
    ...EMPTY_USER,
    ...raw,
    address: mergedAddress,
    referrals: mergedReferrals,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
};

/* =========================
   Provider
========================= */

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load partner/account tier from public.profiles (RLS should allow select own row).
  // If the partner columns aren't installed yet, we fall back safely.
  const fetchAccountAccess = async (userId) => {
    if (!userId || !supabase) {
      return { accountTier: "customer", partnerStatus: "none", partnerTier: null };
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("account_tier, partner_status, partner_tier")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        return { accountTier: "customer", partnerStatus: "none", partnerTier: null };
      }

      return {
        accountTier: data?.account_tier || "customer",
        partnerStatus: data?.partner_status || "none",
        partnerTier: data?.partner_tier ?? null,
      };
    } catch (_e) {
      return { accountTier: "customer", partnerStatus: "none", partnerTier: null };
    }
  };

  /* ---------- SESSION HYDRATION ---------- */
  useEffect(() => {
    let mounted = true;
    let subscriptionRef = null;

    (async () => {
      if (!supabase) { if (mounted) setLoading(false); return; }
      try {
        const { data } = await supabase.auth.getSession();
        const supaUser = data?.session?.user;
        if (!mounted) return;
        if (supaUser) {
          const access = await fetchAccountAccess(supaUser.id);
          setUser(
            hydrateUser({
              id: supaUser.id,
              email: supaUser.email,
              name: supaUser.user_metadata?.full_name || "",
              ...access,
            })
          );
        } else {
          setUser(null);
        }
      } catch (_err) {
        // ignore - keep user null
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    if (!supabase) return () => {};
    const res = supabase.auth.onAuthStateChange(async (_event, session) => {
      const supaUser = session?.user;
      if (!mounted) return;
      if (supaUser) {
        const access = await fetchAccountAccess(supaUser.id);
        setUser(
          hydrateUser({
            id: supaUser.id,
            email: supaUser.email,
            name: supaUser.user_metadata?.full_name || "",
            ...access,
          })
        );
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // handle different return shapes across supabase clients
    subscriptionRef = res?.data?.subscription ?? res?.subscription ?? res?.data;

    return () => {
      mounted = false;
      if (subscriptionRef) {
        if (typeof subscriptionRef.unsubscribe === "function") {
          subscriptionRef.unsubscribe();
        } else if (typeof subscriptionRef.remove === "function") {
          subscriptionRef.remove();
        }
      }
    };
  }, []);

  /* =========================
     AUTH METHODS (REAL)
  ========================= */

  const register = async ({ email, password }) => {
    if (!supabase) throw new Error("Auth not configured");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const login = async ({ email, password }) => {
    if (!supabase) throw new Error("Auth not configured");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const loginWithGoogle = async () => {
    if (!supabase) throw new Error("Auth not configured");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  /* =========================
     PROFILE / COMMERCE LOGIC
     (UNCHANGED FROM YOUR WORK)
  ========================= */

  const addOrder = (order) => {
    setUser((prev) => {
      if (!prev) return prev;
      const orderWithDefaults = {
        id: order.id || Date.now().toString(),
        createdAt: order.createdAt || new Date().toISOString(),
        status: order.status || "Processing",
        items: order.items || [],
        total: order.total || 0,
      };
      return {
        ...prev,
        orders: [orderWithDefaults, ...(prev.orders || [])],
        loyaltyPoints:
          (prev.loyaltyPoints || 0) +
          Math.round((orderWithDefaults.total || 0) / 10),
      };
    });
  };

  const addLoyaltyPoints = (points) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        loyaltyPoints: (prev.loyaltyPoints || 0) + (points || 0),
      };
    });
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      return hydrateUser({
        ...prev,
        ...updates,
        address: {
          ...(prev.address || EMPTY_USER.address),
          ...(updates.address || {}),
        },
      });
    });
  };

  const toggleWishlistItem = (item) => {
    setUser((prev) => {
      if (!prev) return prev;
      const wishlist = prev.wishlist || [];
      const exists = wishlist.find((p) => p.id === item.id);
      return {
        ...prev,
        wishlist: exists
          ? wishlist.filter((p) => p.id !== item.id)
          : [...wishlist, item],
      };
    });
  };

  /* ========================= */

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        addOrder,
        addLoyaltyPoints,
        updateProfile,
        toggleWishlistItem,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
