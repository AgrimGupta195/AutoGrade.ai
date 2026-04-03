import { google } from 'googleapis';
import type { User } from '../database/models/userModel';

export class GoogleAuthError extends Error {
  constructor(
    public code: number,
    public message: string
  ) {
    super(message);
  }
}

/**
 * Initialize Google OAuth2 client with user credentials
 * @param user User object with google tokens
 * @returns Initialized OAuth2 client
 * @throws GoogleAuthError if configuration is incomplete or user lacks tokens
 */
export function getGoogleOAuth2Client(user: User) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${process.env.BE_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new GoogleAuthError(500, 'Google OAuth configuration is incomplete on the server.');
  }

  if (!user.googleRefreshToken && !user.googleAccessToken) {
    throw new GoogleAuthError(400, 'Google Classroom access is not connected yet. Please sign in again with Google consent.');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  return oauth2Client;
}

/**
 * Get authenticated Google Classroom API client
 * @param user User object with google tokens
 * @returns Classroom API instance
 * @throws GoogleAuthError if authentication fails
 */
export function getClassroomClient(user: User) {
  const oauth2Client = getGoogleOAuth2Client(user);
  return google.classroom({ version: 'v1', auth: oauth2Client });
}
