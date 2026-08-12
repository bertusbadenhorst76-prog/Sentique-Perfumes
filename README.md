# Sentique Perfumes website

A complete Next.js perfume storefront with central product management, responsive shopping and WhatsApp checkout. No payment gateway or database is required: the cart is saved in the visitor's browser and an order is completed through WhatsApp.

## Your five most important files

| What you want to change | Where to change it |
|---|---|
| Sentique logo | Add it to `public/images/logo/`, then replace the text logo in `components/Header.js` and `components/Footer.js` with an `<img>` using its path |
| Perfume photos | `public/images/products/` |
| Product names, descriptions and notes | `data/products.js` |
| Prices | the `price` and optional `salePrice` fields in `data/products.js` |
| WhatsApp number and all contact details | `data/settings.js` |

## 1. Add your Sentique logo

1. Save a transparent SVG, PNG or WebP logo in `public/images/logo/`, for example `sentique-logo.png`.
2. Open `components/Header.js` and `components/Footer.js`.
3. Replace the element beginning `<div className="logo"` / `<Link className="logo"` with an image such as `<img src="/images/logo/sentique-logo.png" alt="Sentique Perfumes" />` (keep the Link around the header image).

## 2. Add perfume photos

1. Resize photographs to roughly 900 × 1100 pixels. WebP is recommended for fast loading.
2. Give each one a simple lowercase filename, for example `rose-oud.webp`.
3. Upload it into `public/images/products/`.
4. In `data/products.js`, use `image: '/images/products/rose-oud.webp'`.
5. Add extra paths to `gallery` if you have side/back photographs.

Hero and story photographs belong in `public/images/banners/`. Category photographs belong in `public/images/categories/`. The included SVG files are polished placeholders and can be replaced while keeping the same names.

## 3. Add a new perfume

Open `data/products.js`, copy one complete object between `{` and `}`, paste it immediately before the closing `];`, add a comma between entries, then edit its values. Every product must have a unique `id` such as `009`. Text stays inside quotes, prices are entered without `R`, note lists stay inside square brackets, and true/false values do not use quotes.

```js
+{id:'009', name:'Perfume Name', brand:'Brand Name', category:'Women',
+ size:'100ml', price:699, salePrice:null,
+ image:'/images/products/perfume-name.webp', gallery:['/images/products/perfume-name.webp'],
+ description:'Your description.', topNotes:['Note 1'], middleNotes:['Note 2'], baseNotes:['Note 3'],
+ stock:true, newArrival:false, bestSeller:true, created:12, sales:1},
```

`created` controls “Newest” order (use a higher number for newer items). `sales` controls “Best Selling” order.

## 4. Change a price

Find the perfume in `data/products.js` and change `price:899` to the new number. For a sale, keep the original `price` and set `salePrice` to the reduced amount. Use `salePrice:null` when it is not on sale.

## 5. Mark a perfume out of stock

Change `stock:true` to `stock:false`. Add-to-cart is disabled and an out-of-stock label appears automatically.

## 6. Mark a Best Seller

Change `bestSeller:false` to `bestSeller:true`. It automatically appears in Best Sellers searches and receives a badge unless it has a higher-priority New or Sale badge.

## 7. Mark a New Arrival

Change `newArrival:false` to `newArrival:true`. It automatically appears in the New Arrivals section and filter.

## 8. Change the WhatsApp number

Open `data/settings.js` and replace `27XXXXXXXXX` once. Use South African international format with digits only: start with `27`, remove the first zero, and do not add `+`, spaces or dashes (example `27821234567`). All product, cart, contact and floating WhatsApp links update together.

## 9. Change contact information

Edit the clearly labelled values in `data/settings.js`: telephone, email, Instagram, TikTok and business hours. About text, reviews and homepage headings are in `app/page.js`.

## 10. Preview the website

Install Node.js 18.17 or newer, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Stop it with Ctrl+C. Test a production version with `npm run build && npm start`.

## 11. Publish / deploy

The simplest option is Vercel:

1. Create a GitHub account and repository, then upload this project.
2. Sign into Vercel, choose **Add New → Project**, and import the repository.
3. Vercel detects Next.js automatically. Keep the defaults and click **Deploy**.
4. In project settings, add your own domain if desired.
5. For later catalogue changes, edit `data/products.js` in GitHub and commit; Vercel republishes automatically.

## Pages and features

- `/` — editorial homepage, categories, featured/new products, brands, story, benefits, reviews and social placeholders
- `/shop` — live name/brand search, filters and all requested sort orders
- `/product/001` (and every product id) — gallery, availability, notes, quantity, cart and recommendations
- `/contact` — contact information and form that safely opens WhatsApp
- `/policies` — delivery, returns, privacy and terms starter copy (review before launch)

The cart persists in the browser, supports quantity changes/removal/totals, and creates a complete WhatsApp order. Replace placeholder business information and review all policy copy before going live.
