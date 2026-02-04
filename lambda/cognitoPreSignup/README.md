# Cognito Pre sign-up Lambda

This Lambda runs **before** each new user is created in Cognito. It tells Cognito to:

- **autoVerifyEmail: true** – Mark the user’s email as verified so:
  - Forgot password can send the reset code to their email.
  - You don’t need a separate email verification step if your app doesn’t use it.
- **autoConfirmUser: true** – Mark the user as confirmed so they can sign in without confirming via email.

## Attach to your User Pool

1. In **AWS Console** → **Cognito** → your User Pool (e.g. `preafa1fbaa_userpool_afa1fbaa`).
2. Go to **User pool properties** → **Lambda triggers**.
3. Under **Pre sign-up**, choose this Lambda (create the function first if needed).
4. Save.

**Existing users** created before this trigger was attached still have unverified email in Cognito. For them you can either:

- In Cognito → **Users** → select user → **Edit** and set email as verified (if the console allows), or
- Use **AdminUpdateUserAttributes** (e.g. from a small admin script or Lambda) to set `email_verified` to `true` for those users.

## Deploying the Lambda

- Create a Lambda in the same region as your Cognito User Pool.
- Runtime: **Node.js 18.x** (or 20.x).
- Paste the `handler.js` code as the handler.
- No environment variables or layers required.
- Ensure the User Pool can invoke this Lambda (Cognito will add the permission when you assign the trigger, or add a resource-based policy allowing `cognito-idp.amazonaws.com` to invoke the function).
