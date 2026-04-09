import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import cors from "cors";

console.log("Stripe key loaded:", process.env.STRIPE_SECRET_KEY?.slice(0, 10));

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    console.log("Stripe route hit");
    console.log("Items:", req.body.items);

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [`${process.env.FRONTEND_URL}${item.image}`],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity) || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cart",
    });

    console.log("🔥 SERVER.JS RESPONSE PAYLOAD 🔥", {
      url: session.url,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => {
  console.log("Stripe API running on http://localhost:4242");
});
