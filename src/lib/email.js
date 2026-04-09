import { Resend } from "resend";

// This module is used server-side only (Vercel functions / dev-server).
// eslint-disable-next-line no-undef
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  amount,
}) {
  return resend.emails.send({
    from: "Style Eternal <orders@styleeternal.com>",
    to,
    subject: `Order ${orderNumber} confirmed — Style Eternal`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #E8E4DE; background: #0A0A0A; padding: 32px;">

        <h1 style="font-weight: 300; letter-spacing: 0.06em; color: #E8E4DE;">
          Order Confirmed
        </h1>

        <p style="color: #E8E4DE;">
          Thank you for shopping with <strong>Style Eternal</strong>.
        </p>

        <p style="color: #E8E4DE;">
          Your order <strong>${orderNumber}</strong> has been placed and is now being prepared.
        </p>

        <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 24px 0;" />

        <p style="color: #E8E4DE;">
          <strong>Total Paid:</strong><br />
          $${(amount / 100).toFixed(2)} USD
        </p>

        <p style="color: #E8E4DE;">
          <strong>What happens next:</strong>
        </p>

        <ul style="padding-left: 18px; color: #E8E4DE;">
          <li>Final quality check</li>
          <li>Premium packaging</li>
          <li>Shipment within <strong>2-3 business days</strong></li>
        </ul>

        <p style="color: #E8E4DE;">
          You'll receive a shipping confirmation with tracking details once your order ships.
        </p>

        <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 24px 0;" />

        <p style="font-size: 12px; color: #6B6B6B;">
          Style Eternal<br />
          Born in Newark · Built to Last
        </p>

        <p style="font-size: 12px; color: #6B6B6B;">
          Need help? Contact us at <a href="mailto:support@styleeternal.com" style="color: #C4A35A;">support@styleeternal.com</a>
        </p>
      </div>
    `,
  });
}
