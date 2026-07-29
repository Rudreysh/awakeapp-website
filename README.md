# awake Website

Static pre-launch website for `awakeapp.net`.

## Files

- `index.html`: landing page with a free waitlist and $5 Early Adopter checkout flow
- `blog.html`: launch and product update page
- `privacy.html`: pre-launch privacy policy
- `terms.html`: pre-launch terms and conditions
- `styles.css`: shared website styles
- `config.js`: public Stripe Payment Link configuration
- `api/waitlist.js`: Vercel Function that sends signup notifications through Resend
- `script.js`: waitlist, Early Adopter modal, and checkout flow

## Deploy to Vercel

1. Import this repository in Vercel
2. Framework preset: `Other`
3. Root directory: repository root
4. Deploy

No build step is required for this version.

## Activate lead capture and checkout

1. Create a `$5` product and Payment Link in Stripe, then paste its public
   `https://buy.stripe.com/...` URL into `config.js` as `stripePaymentLink`.
2. In Vercel, add these environment variables:
   - `RESEND_API_KEY`: API key from Resend.
   - `WAITLIST_FROM`: a verified sender, for example `Awake <hello@awakeapp.net>`.
   - `WAITLIST_RECIPIENT`: optional; defaults to `info@awakeapp.net`.
3. Redeploy. The waitlist form sends each signup to the recipient, and the
   Early Adopter form records checkout intent before opening Stripe Checkout.

Until both Stripe and Resend are configured, checkout and lead capture remain
disabled with a clear visitor-facing message rather than silently losing data.
