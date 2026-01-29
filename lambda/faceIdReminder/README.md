# Face ID Reminder Lambda

Sends a friendly push notification every **2 days** to **approved** users who have **no Face ID set up**, reminding them that Face ID is how they enter their residential compound. Stops automatically once they set it up.

## Logic

- Scan `users` table (paginated).
- **Include** users who:
  - Have at least one project (compound),
  - Are approved (`approvalStatus === 'approved'`),
  - Are not suspended,
  - Do **not** have Face ID set up (`documents.faceEnrolledAt` or `documents.faceEnrollments`),
  - Either have never been reminded, or were last reminded **≥ 2 days** ago (`documents.lastFaceIdReminderAt`).
- For each: create a notification in `projects__notifications` (audience = user id), then set `documents.lastFaceIdReminderAt` to now.

## Notification copy (user‑friendly)

- **Title (EN):** "Set up Face ID to enter your compound"
- **Title (AR):** "فعّل التعرف على الوجه لدخول مجمعك السكني"
- **Body (EN):** "Your face is your key to enter your residential compound. Set up Face ID in the app so you can get in smoothly."
- **Body (AR):** "وجهك هو مفتاح دخولك لمجمعك السكني. فعّل التعرف على الوجه في التطبيق للدخول بسلاسة."
- **Meta:** `{ url: '/profile/face-verification' }` for deep‑link.

## Env vars

| Variable | Default | Description |
|----------|---------|-------------|
| `USERS_TABLE` | `users` | DynamoDB users table |
| `NOTIFICATIONS_TABLE` | `projects__notifications` | DynamoDB notifications table |
| `FACE_ID_REMINDER_PROJECT_ID` | `default` | Fallback project when user has no projects |
| `REMINDER_INTERVAL_DAYS` | `2` | Min days between reminders |
| `FACE_ID_REMINDER_SCAN_LIMIT` | `500` | Max users per scan page |

## Permissions

Lambda execution role needs:

- `dynamodb:Scan` on `users`
- `dynamodb:UpdateItem` on `users`
- `dynamodb:PutItem` on `projects__notifications`

## CloudWatch schedule

Run **daily** (the 2‑day throttle is in Lambda logic):

- **Rate:** `rate(1 day)`

Or with cron (e.g. 9:00 UTC):

- **Cron:** `cron(0 9 * * ? *)`

Create a CloudWatch Events rule with the chosen schedule and target this Lambda.

## Deploy

1. `cd lambda/faceIdReminder && npm install`
2. Zip handler + `node_modules`:  
   `zip -r ../faceIdReminder.zip . -x '*.git*' -x 'node_modules/*'`
3. Create Lambda (Node 18+), upload zip, set handler `handler.handler`.
4. Add the CloudWatch schedule and attach this Lambda.
