
Bhai aap ne 9 alag kaam bole — main priority order mein karoonga. Pehle confirm karein, phir step-by-step build karta hoon (1-2 step per turn taake kuch bhi tutay nahi).

## Issue analysis

1. **Lucky Draw list mein name nahi aya** — current code `localStorage` se entries dikhata hai, DB se nahi. Isi liye aap ko apna name nahi dikha. Fix: `lucky_entries` table se realtime fetch + sab visitors ko same list dikhao.

2. **Admin prize amount edit option nahi** — `lucky_settings` table to bani hui hai (2/5/10 Rs), but admin UI page (`/admin/lucky`) abhi bana hi nahi. Banana hai.

3. **Wiki Store ka link nahi, aur hacking sidebar wahan nahi chahiye** — `/store` route + product grid + checkout banana hai, header mein "Wiki Store" link, store ke andar separate clean nav (no hacking links).

4. **Admin mein image/video URL ki jagah upload chahiye** — `store-products` storage bucket already public hai. File upload component banake admin product form mein lagana hai.

5. **Apni preview site ka link** — aap ko apna preview URL aap k apne admin dashboard mein dikhana hai (`https://id-preview--b0b518a0-beff-4869-960e-49b3e4b84bdb.lovable.app`). Admin Settings page mein "Preview / Live URLs" card add karoonga.

6. **Admin panel mein "har cheez edit" / coding option** — full admin panel ke liye: Site name, contact, WhatsApp number, theme, banner/announcement, hero text, footer text, sab editable fields. Yeh `site_settings` table mein already partial hai — expand karoonga.

7. **Side mein Wiki Store option, store khulne par hacking nav hide** — header mein Wiki Store link + store routes ka apna minimal layout (Home / Store / Cart / My Orders), no hacking pages.

8. **Fake-WhatsApp glitch** — page check karke fix karoonga (probably state/render bug).

9. **User activity / buy details admin mein nahi dikh rahi** — `/admin/activity` page banake saare users ki orders + lucky entries + store orders + pro-account purchases ek table mein dikhao.

## Plan (recommended order — 4 turns mein complete)

**Turn 1 (abhi)** — Most painful issues fix:
- Lucky Draw: DB se live participants list (sab ko visible)
- Admin Lucky page (`/admin/lucky`): prize amount 2/5/10 dropdown + winners list + manual pick
- Activity page (`/admin/activity`): all users ki saari purchases ek jagah
- Fake-WhatsApp glitch fix

**Turn 2** — Wiki Store frontend:
- `/store` route (clean grid, -30% badge, prices)
- `/store/$slug` product detail
- Store checkout (address + PayFast Rs.1 tax)
- Header link "Wiki Store" + store-only minimal nav (hacking links hidden)

**Turn 3** — Admin enhancements:
- Image/video gallery upload component (Supabase Storage)
- `/admin/store` product CRUD with upload
- Admin Settings expand: store name, contact, WhatsApp, hero text, banner — sab editable
- Preview/Live URL card in admin dashboard

**Turn 4** — Polish:
- Verify everything works
- Theme consistency (black + red glow ALL pages)
- Mobile responsive check

## Confirm karein

1. Yeh order theek hai? Ya pehle Wiki Store chahiye?
2. Turn 1 abhi shuru kar dun?
