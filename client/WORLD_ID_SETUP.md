# World ID Setup Guide for Orbital Tester Portal

## 1. Create World ID App

1. Go to [World ID Developer Portal](https://developer.worldcoin.org)
2. Create a new app or use an existing one
3. Note down your App ID (format: `app_staging_xxxxx` for staging or `app_xxxxx` for production)

## 2. Create Action

In your World ID app, create a new action:
- **Action Name**: `tester_verification`
- **Description**: "Verify humanity before accessing Orbital tester portal"
- **Max Verifications**: Set based on your needs (e.g., 1 per person)

## 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Update the following variables in `.env.local`:
- `APP_ID`: Your World ID App ID (for server-side verification)
- `NEXT_PUBLIC_WORLDCOIN_APP_ID`: Same App ID (for client-side MiniKit)

## 4. Testing

1. Make sure you have the World App installed on your mobile device
2. Complete World ID verification (Orb verification recommended for production)
3. Test the verification flow in your app

## 5. Production Deployment

- Update `APP_ID` and `NEXT_PUBLIC_WORLDCOIN_APP_ID` to production values
- Ensure your production domain is added to your World ID app settings
- Test the verification flow thoroughly

## Verification Flow

1. User visits `/apps` (tester portal)
2. `WorldIDVerificationGate` component checks if user is verified
3. If not verified, shows verification screen
4. User clicks "Verify with World ID"
5. MiniKit opens World App for verification
6. On success, proof is sent to `/api/verify` for server-side verification
7. If valid, user gains access to tester portal
8. Verification status is stored in localStorage for future visits
