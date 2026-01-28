# API Documentation

Base URL (Production): `https://[YOUR-VERCEL-URL].vercel.app`
Base URL (Local): `http://localhost:3000`

---

## 1. Get Phone Models
Fetch the list of all supported iPhone models, including their maximum possible price (for display purposes).

- **Endpoint**: `GET /api/models`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "iPhone 13",
      "name": "iPhone 13",
      "maxPrice": 7000000,
      "image": "/assets/models/iphone-13.png"
    },
    ...
  ]
}
```

---

## 2. Get Storage Options
Fetch available storage sizes for a specific model.

- **Endpoint**: `GET /api/storage`
- **Query Params**:
  - `model`: (Required) Model name, e.g., "iPhone 13"
- **Response**:
```json
{
  "success": true,
  "data": [
    { "storage": "128GB", "price": 6000000 },
    { "storage": "256GB", "price": 7000000 }
  ]
}
```

---

## 3. Calculate Quote
Get the exact estimated price based on user answers.

- **Endpoint**: `POST /api/quote`
- **Body**:
```json
{
  "model": "iPhone 13",
  "storage": "128GB",
  "batteryHealth": 88,
  "hasBox": true,
  "boxMatchesImei": true,
  "screenCondition": "flawless",        // Options: flawless, light_scratches, heavy_scratches, cracked
  "bodyCondition": "light_scratches"    // Options: flawless, light_scratches, heavy_scratches, dented
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "estimatedPriceInternal": 5700000,
    "minPrice": 5695000,
    "maxPrice": 5700000,
    "rank": "S",
    "isHardReject": false,
    "breakdown": { ... }
  }
}
```

---

## 4. Submit Lead
Save the user's data and final price to Google Sheets + Trigger N8N.

- **Endpoint**: `POST /api/lead`
- **Body**: Same as Quote, plus contact info.
```json
{
  "model": "iPhone 13",
  "storage": "128GB",
  "batteryHealth": 88,
  "contactName": "Johny",
  "contactWhatsapp": "08123456789",
  "screenCondition": "flawless",
  "bodyCondition": "flawless",
  "boxCondition": "original",             // Options: original, non_original, unit_only
  ...
}
```
- **Response**:
```json
{ "success": true }
```
