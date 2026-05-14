
Bohot kaam hai is request mae — main 5 alag features bana raha hun. Pehle plan confirm karein, phir implement karoon ga.

## 1. Lucky Draw — WhatsApp hatao, public prize list lagao

**Changes to `/lucky-draw`:**
- Payment ke baad WhatsApp redirect **hata do**. Bajaye iske, user ka naam + masked phone + payment time turant **"Today's Participants" public list** mae add ho jaye (sab ko visible).
- New DB table `lucky_entries` (user_id, name, phone_masked, amount, paid_at, draw_date) — har payment success par insert.
- Public realtime list — sab visitors dekh sakein kaun kaun ne join kiya.
- Daily 10:00 PM auto-pick (server cron via `/api/public/lucky-draw-cron` route, callable manually by admin too) — ek random winner select hota hai us din ke entries mae se.
- Winner ko apne login mae ek **"Claim Prize / Withdraw"** banner dikhe — form mae:
  - Method: Easypaisa / JazzCash / Bank
  - Account number / IBAN
  - Account holder name
  - Submit → `withdrawal_requests` table mae jaye (admin ko visible).

**3 Prize Tier Setting (Admin only):**
- New table `lucky_settings` (id=1, prize_amount: 2 | 5 | 10).
- Admin panel mae dropdown: "Per-winner prize: Rs.2 / Rs.5 / Rs.10".
- Lucky draw page header par live show ho: "Aaj ka prize: Rs.X".

## 2. Admin Panel Enhancements (haki84226@gmail.com only)

- **All users activity view**: ek new admin route `/admin/activity` jahan saare users ki orders, lucky entries, pro-account purchases, fake-whatsapp orders sab dikhe (user → kya buy kiya → kab → kitna paid).
- Edit/view permission sirf admin ko (already `has_role(admin)` exists).
- Existing admin tabs ke saath integrate.

## 3. Site-Wide Popup Broadcast (Admin controlled)

- New table `site_announcements` (id=1, message text, active boolean, updated_at).
- Admin ke `/admin/settings` mae ek textarea + active toggle.
- Har user ke liye popup dikhe:
  - **Site open hote hi** (page load par 1.5s baad).
  - **Site close hone se pehle** (`beforeunload` / `visibilitychange=hidden` par bhi ek halka modal — beforeunload native confirm use karenge kyunki custom modal close pe block nahi hota; alternative: jab tab hidden ho jaye to next visit par dikhayen).
- Message pure HTML allow nahi, plain text only (security).
- LocalStorage flag se same message dobara session mae spam na ho.

## 4. New Wiki Store E-commerce Page (`/store`)

Reference: onerwear.com screenshot — clean grid, -30% badge, image, title, price (red), strikethrough old price, bag + eye icons.

- **Theme**: same black + red glow (existing site jaisa).
- **Header text**: "Wiki Services" top par + "Wiki Store" sub-header.
- **Layout**: 2-column mobile grid, 4-column desktop.
- **Each card**: product image, -30% red badge, name (no hacking words), Rs. price + old price, sizes (if applicable), bag (add to cart) + eye (view) icons, ✅ database-style ticks/emojis (e1, e4, e12 etc.).
- **No hacking links** is page par — header mae sirf: Home / Store / Cart / My Orders. Hacking pages ki separate link footer mae chhupi rahe ya admin only.
- **Categories** seed: Dress, Collar Shirt, Co-Ord Set, Accessories (admin add kar sake).
- **Order flow**: Add to cart → checkout (address/phone) → PayFast checkout (same Rs.1 tax merchant) → success → order saved in `store_orders` (with delivery address, items JSON, status: pending).
- **My Orders** page mae store orders alag tab.

**Admin store management** (`/admin/store`):
- Upload product (image/video, title, price, old_price, sizes, category, description).
- Edit / delete / mark out-of-stock.
- View all orders, mark as shipped/delivered.
- Storage bucket: `store-products` (public) for images/videos.

## 5. Database Migrations

```sql
-- Lucky draw
create table lucky_entries (...);
create table lucky_winners (id, draw_date unique, entry_id, prize_amount, claimed bool);
create table lucky_settings (id=1 singleton, prize_amount int check in (2,5,10));
create table withdrawal_requests (id, user_id, winner_id, method, account_no, account_name, status, created_at);

-- Announcements
create table site_announcements (id=1, message, active, updated_at);

-- Store
create table store_categories (id, name, slug, sort);
create table store_products (id, category_id, title, slug, description, price, old_price, sizes text[], image_url, video_url, in_stock, created_at);
create table store_orders (id, user_id, items jsonb, total, address, city, phone, status, payfast_basket, created_at);
```

RLS:
- Public read on `store_products`, `store_categories`, `lucky_entries` (masked), `lucky_winners`, `site_announcements`, `lucky_settings`.
- Authenticated users: insert own `store_orders`, `withdrawal_requests`, view own orders.
- Admin (via `has_role(admin)`) full CRUD on everything.

## 6. Files I'll create/modify

**New:**
- `src/routes/store.tsx` — product grid (Wiki Store)
- `src/routes/store.$slug.tsx` — product detail
- `src/routes/store-checkout.tsx` — address + payfast
- `src/routes/admin.store.tsx` — admin product CRUD
- `src/routes/admin.activity.tsx` — all-users activity log
- `src/routes/admin.lucky.tsx` — pick winner / set prize tier / view withdrawals
- `src/routes/api/public/lucky-draw-cron.ts` — auto winner picker (also manual)
- `src/components/site/site-announcement-popup.tsx` — open + close popup
- `src/components/site/withdrawal-form.tsx` — winner claim form
- migrations for tables above

**Modified:**
- `src/routes/lucky-draw.tsx` — remove WhatsApp, show public list (DB), show today's prize, winner banner with withdraw button
- `src/components/site/payfast-checkout.tsx` — accept `onSuccessSave` callback to write to DB tables (lucky_entries / store_orders) instead of WhatsApp
- `src/routes/payfast-result.tsx` — based on intent type, save to right table; for lucky draw skip WhatsApp
- `src/routes/__root.tsx` — mount `<SiteAnnouncementPopup />`
- `src/routes/admin.settings.tsx` — announcement editor
- `src/components/site/header.tsx` — store link, hide hacking from store mode (or just add "Store" link)
- `src/routes/my-orders.tsx` — add store orders tab

## Out of scope (will NOT touch)

- Existing pro-accounts, sim-database, fake-whatsapp pages design/payment flow (already working — chhedna nahi).
- Existing hacking-related pages — bas store page se unke direct links remove honge.
- "Wiki Services" branding header — already hai, sirf confirm.

---

**Confirm karein:**
1. Yeh plan thik hai?
2. Store ke liye starter products ki kuch sample seed entries chahiye ya admin khud add kare ga?
3. "Site close popup" ke liye browser native `beforeunload` confirm dialog (most browsers ab custom message support nahi karte) ya next-visit par dikhayen wala approach?
