/**
 * Cognito Pre sign-up Lambda trigger
 *
 * Purpose: Auto-verify email and auto-confirm user so that:
 * - New sign-ups don't require email verification (app doesn't use it).
 * - Forgot password works (Cognito requires a verified email/phone for reset).
 *
 * Attach in AWS Console:
 *   Cognito → Your User Pool → User pool properties → Lambda triggers → Pre sign-up → this function
 *
 * Or with Amplify: amplify update auth → choose "Walkthrough" → Lambda triggers → Pre sign-up.
 */

exports.handler = async (event) => {
  // Auto-verify email so Cognito marks email_verified = true (required for forgot password).
  if (!event.response) {
    event.response = {}
  }
  event.response.autoVerifyEmail = true
  event.response.autoVerifyPhone = false
  // Auto-confirm user so they can sign in without confirming via email link/code.
  event.response.autoConfirmUser = true

  return event
}
