# MYBYTE KAITORI — PRD v0.1 (MVP)

Status: Prototype / MVP  
Last updated: 2026-01-05  
Owner: MyByte  
Audience: Product, Engineering, Operations

---

## 1. Product Overview

### 1.1 Product Goal
Build a public MVP buyback (kaitori) website (maujual.com clone) for MyByte to:
- Validate pricing logic and user flow
- Generate qualified leads
- Reduce manual price inquiries

This MVP is publicly accessible but **operated manually by staff**.



### 1.2 Non-Goals (Explicit)
- Customer login
- Photo uploads
- Status tracking
- Auto approval
- Online payment
- Custom admin dashboard

---

## 2. User Persona

### 2.1 Primary Persona — Indonesian Residents in Japan
- Owns a personal iPhone
- Wants transparent price estimation
- Concerned about being underpriced
- Language: Indonesian

### 2.2 Secondary Persona — MyByte Staff
- Maintains pricing via Google Sheets
- Follows up leads manually
- Performs physical inspection
- Confirms final price

---

## 3. User Flow (FIXED)

1. User lands on website
2. Select iPhone model
3. Select storage
4. Answer hard-reject questions
5. Answer condition questionnaire
6. System calculates estimated price
7. Price range + disclaimer shown
8. Contact form appears
9. User submits lead
10. Lead stored for manual follow-up

---

## 4. Scope Definition

### 4.1 In Scope
- iPhone only
- Rule-based pricing
- Price estimation with breakdown
- Lead submission
- Manual follow-up

### 4.2 Out of Scope
- Authentication for customers
- Image upload
- Payment
- Automated approval
- Customer status tracking

---

## 5. Pricing System (MVP)

### 5.1 Pricing Formula
Internal Price =
Base Price
– Rank Deduction
– Battery Deduction
– Box Deduction
Displayed price is a **range**, not a final price.

---

### 5.2 Base Price
- Determined by:
  - iPhone model
  - Storage
- Source of truth: Supabase
- Edited via Google Sheets (sync only)

---

### 5.3 Estimated Price Range (User Visible)

- System calculates **1 internal price**
- Displayed range:
Estimated Price: (Internal Price - 5,000) – Internal Price
**Example:**
Internal price: ¥95,000  
Displayed: ¥90,000 – ¥95,000

**Mandatory Disclaimer:**
> “Harga di atas adalah estimasi. Harga final ditentukan setelah pengecekan kondisi fisik oleh tim MyByte.”

---

## 6. Hard Reject Rules (Pre-Pricing Gate)

If **any** condition below is true → HARD REJECT:

- Device cannot power on
- iCloud is still logged in
- Battery health < 80% / Battery Service
- Model not accepted by MyByte

Hard reject behavior:
- No price estimation shown
- Contact form not shown
- User sees rejection message + optional CTA (chat)

Hard reject is **not** a system error.

---

## 7. Rank System (Placeholder)

> Definitions are placeholders and can be updated without code changes.

### 7.1 Rank Levels
- S+
- S
- A+
- A

### 7.2 Rank Determination (High-Level)
Rank is determined based on:
- Screen condition
- Body / frame condition

Example placeholder logic:
- **S+**: Screen & body are flawless
- **S**: Screen flawless, very light body marks
- **A+**: Light screen scratches
- **A**: Noticeable scratches but still acceptable

If condition exceeds acceptable limits → HARD REJECT

---

### 7.3 Rank Deduction (MVP)

Flat deduction per rank:
- Each downgrade = **−¥3,000**

Example (relative):
- S+ → ¥0
- S → −¥3,000
- A+ → −¥6,000
- A → −¥9,000

Values are editable via Google Sheets.

---

## 8. Battery Health Rules

### 8.1 Acceptance
- 95–100% → no deduction
- 90–94% → deduction
- 85–89% → deduction
- 80–84% → deduction
- <80% / Battery Service → HARD REJECT

### 8.2 Battery Deduction
- Flat deduction per range
- Initial value: **¥3,000 per 5% drop**
- Editable via Google Sheets
- Enforced server-side

---

## 9. Box / Packaging Rules

### 9.1 Box Status
- With box (IMEI match) → no deduction
- No box → flat deduction

### 9.2 Special Rule
- Box present but IMEI does not match device → treated as **NO BOX**

Initial deduction:
- No box → −¥3,000

Editable via Google Sheets.

---

## 10. Error Handling (MVP – Simple)

### 10.1 Response Types

#### A. Hard Reject (Business Rule)
- HTTP: `200`
```json
{
  "result": "REJECT",
  "reason": "BATTERY_BELOW_80"
}
```

Frontend:
- Show rejection message
- Stop flow

---

#### B. Validation Error
- HTTP: `400`
- Generic message:
> “Data yang kamu isi belum lengkap atau tidak valid.”

---

#### C. System Error
- HTTP: `500`
- Generic message:
> “Terjadi kendala sistem. Silakan coba lagi nanti.”

---

## 11. Lead Storage

Supabase Table: `leads`
- `id`
- `device_model`
- `storage`
- `rank`
- `condition_json`
- `estimated_price_internal`
- `estimated_price_range_min`
- `estimated_price_range_max`
- `name`
- `phone` / `whatsapp`
- `email` (optional)
- `source`
- `created_at`

Leads are editable by staff during MVP.

---

## 12. Anti-Spam & Security (MVP)
- Rate limiting on:
  - `POST /api/quote`
  - `POST /api/leads`
- Honeypot field
- No captcha for MVP
- Supabase service role key used server-side only

---

## 13. Data Governance
- Pricing source of truth: Supabase
- Google Sheets: editor UI only
- Frontend never reads Sheets directly
- Public users cannot read any data

---

## 14. Phase Roadmap

### Phase 0 — MVP (Current)
- Price estimation
- Lead submission
- Manual operation

### Phase 1
- Admin dashboard
- Status tracking
- Photo upload

### Phase 2
- Customer login
- Partial automation

---

## 15. Technology Stack

### 15.1 Core Stack
- **Design**: Clean & Trustworthy (Ref: mybyte.store). Minimalist, White/Orange/Blue accents. **AVOID** Dark Mode/AI-Vibe.
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Subtle micro-interactions (Framer Motion)
- **Database**: Supabase (PostgreSQL)

### 15.2 Integrations
- **Pricing CMS**: Google Sheets (Synced to Supabase via API Route)
- **Notifications**: Telegram Bot (via API)
- **State Management**: React Hook Form
- **Deployment**: Vercel (Recommended)

---

## 16. Detailed Database Schema (Planned)

### 16.1 Table: `phone_models`
*Stores base price for each model variant.*
- `id` (uuid)
- `model_name` (text)
- `storage` (text)
- `base_price` (int)
- `image_url` (text, placeholder for now)

### 16.2 Table: `pricing_config`
*Stores deduction rules to avoid hardcoding.*
- `key` (text, e.g. `deduction_rank_s`, `deduction_no_box`)
- `value` (int)
- `description` (text)

### 16.3 Table: `leads` (Updated)
- `id` (uuid)
- `contact_name`
- `contact_whatsapp`
- `device_model` (snapshot)
- `final_estimated_price` (range)
- `status` (new, contacted, done)