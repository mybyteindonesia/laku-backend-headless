# Laku Backend (Headless)

This is a **Headless Backend** service built with Next.js, designed to power frontend applications (like Framer, Webflow, or custom React apps) for the Laku device buyback platform.

It provides API endpoints to:
1.  Fetch available phone models and prices.
2.  Calculate estimated trade-in values based on device condition.
3.  Submit customer leads to Google Sheets and N8N workflows.

## Technology Stack
- **Framework**: Next.js (App Router)
- **Database (Pricing & Leads)**: Google Sheets (via Service Account)
- **Workflow Automation**: N8N (Webhooks)
- **Deployment**: Vercel

## API Reference
This backend exposes public REST APIs. See [API_DOCS.md](./API_DOCS.md) for full documentation on how to use them in your frontend.

### Quick Endpoints Summary
- `GET /api/models`: List all phone models.
- `GET /api/storage?model=iPhone 13`: List storage options.
- `POST /api/quote`: Calculate price based on condition.
- `POST /api/lead`: Submit a new trade-in request.

## Local Development

1.  **Clone the repo**
    ```bash
    git clone https://github.com/mybyteindonesia/laku-backend-headless.git
    cd laku-backend-headless
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env.local` file (see `SetupGuide.MD`) with your Google Cloud credentials.

4.  **Run Server**
    ```bash
    npm run dev
    ```

## deployment
Deploy to **Vercel** for best performance. Ensure all environment variables are properly configured in Vercel Project Settings.
