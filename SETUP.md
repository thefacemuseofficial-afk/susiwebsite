# Website Publishing and Store Privacy Setup

## Publish the Landing Site

The current router publishes `/`, `/feedback`, `/privacy`, and `/delete-account`. The other app screens, including scanning and login, are not currently exposed as routes. Netlify can publish the static frontend and provide HTTPS; the backend and MongoDB must be hosted separately before account or scanning features can work.

Connect this GitHub repository to a new Netlify site and deploy the `main` branch. After the first deploy, add `chicshades.club` and `www.chicshades.club` as custom domains in Netlify, then use the exact DNS records it provides in GoDaddy. Do not change MX records; those deliver your Google email.

Both `feedback` and `account-deletion` submissions use Netlify Forms. After the first successful deploy, enable email notifications for both forms in the Netlify site and set the recipient to `feedback@chicshades.club`. Netlify must detect the forms during a production build; local development does not deliver submissions. Submit a test on the deployed site and confirm it arrives in the inbox.

The public policy URL is `https://chicshades.club/privacy`. The account deletion request URL is `https://chicshades.club/delete-account`. Requests are sent to the inbox for manual verification and processing; they do not automatically erase account data. If users can create accounts in an app, provide an in-app way to request deletion as well and meet each store's deletion timeframe.

## App Store Privacy Disclosures

The website policy is only one part of store compliance. Complete the separate Google Play Data Safety form and Apple App Privacy details for each app version, based on every SDK and data flow in the shipped Android and iOS apps. The code in this repository indicates these items need review and likely disclosure: account email/name and Google profile image; skin-analysis photos sent to Google Gemini and resulting skin-tone/face attributes; saved profiles, favourites, product scan history, and subscription status; feedback and deletion-request messages; and service providers including Google, Gemini, Netlify, MongoDB, Stripe, and Resend where those services are used by the app. Identify whether each data type is collected, shared, linked to the account, or used for tracking according to each store's definitions. Do not mark the app as not collecting or not sharing data solely because the original photo is not stored in the app database.

Before submitting, confirm the legal operator name and contact details, minimum age/target audience, actual retention and deletion process, Gemini API data settings, and all SDKs used by the published mobile apps. These details are not fully verifiable from this website repository, so check the policy and store answers against the actual app builds. Google's policies: [User Data](https://support.google.com/googleplay/android-developer/answer/10144311) and [account deletion](https://support.google.com/googleplay/android-developer/answer/13316080). Apple's guidance: [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/).

## Gemini API Configuration

Keep `GEMINI_API_KEY` server-side only. Do not place it in frontend environment variables or commit it. The API server must be hosted separately and its URL configured at frontend build time as `REACT_APP_BACKEND_URL` before sign-in or image analysis can work.