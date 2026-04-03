import { Request, Response, Router } from 'express';
import passport from '../auth/passport';  // import passport from our custom passport file
import * as AuthService from '../services/AuthService';  // assuming you have a service
import type { User } from '../database/models/userModel';
import UserModel from '../database/models/userModel';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const GOOGLE_AUTH_SCOPES = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.addons.student',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/drive.readonly',
];

const GOOGLE_AUTH_OPTIONS = {
  scope: GOOGLE_AUTH_SCOPES,
  accessType: 'offline' as const,
  prompt: 'consent' as const,
  includeGrantedScopes: true,
};

// Local login route with auto-signup fallback
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, fullName } = req.body as { email?: string; fullName?: string };

    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    let user = await UserModel.findOne({ email });

    // If user does not exist, create account automatically.
    if (!user) {
      const derivedName = email.split('@')[0] || 'User';
      user = await UserModel.create({
        googleId: `local-${uuidv4()}`,
        email,
        fullName: fullName || derivedName,
        jwtSecureCode: uuidv4(),
      });
    }

    const authToken = AuthService.generateToken({
      id: user.id,
      jwtSecureCode: user.jwtSecureCode,
    });

    return res.status(200).json({
      message: 'Login successful',
      authToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred during login', error });
  }
});

// Local signup route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, fullName } = req.body as { email?: string; fullName?: string };

    if (!email || !fullName) {
      return res.status(400).json({ message: 'email and fullName are required' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const createdUser = await UserModel.create({
      googleId: `local-${uuidv4()}`,
      email,
      fullName,
      jwtSecureCode: uuidv4(),
    });

    const authToken = AuthService.generateToken({
      id: createdUser.id,
      jwtSecureCode: createdUser.jwtSecureCode,
    });

    return res.status(201).json({
      message: 'User signed up successfully',
      authToken,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred during signup', error });
  }
});

/*
  This route triggers the Google sign-in/sign-up flow. 
  When the frontend calls it, the user will be redirected to the 
  Google accounts page to log in with their Google account.
*/
// Google OAuth2.0 route
router.get('/google', passport.authenticate('google', GOOGLE_AUTH_OPTIONS));

// Google signup route (same OAuth flow, explicit endpoint for frontend)
router.get('/google/signup', passport.authenticate('google', GOOGLE_AUTH_OPTIONS));


/*
  This route is the callback endpoint for Google OAuth2.0. 
  After the user logs in via Google's authentication flow, they are redirected here.
  Passport.js processes the callback, attaches the user to req.user, and we handle 
  the access token generation and redirect the user to the frontend.
*/
// Google OAuth2.0 callback route
router.get('/google/callback', passport.authenticate('google', { session: false }), (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    // handle the google callback, generate auth token
    const { authToken } = AuthService.handleGoogleCallback({ id: user.id, jwtSecureCode: user.jwtSecureCode });

    // redirect to frontend with the accessToken as query param
    const baseFrontendUrl = process.env.FE_BASE_URL || `${process.env.BE_BASE_URL || 'http://localhost:3000'}/test`;
    const separator = baseFrontendUrl.includes('?') ? '&' : '?';
    const redirectUrl = `${baseFrontendUrl}${separator}accessToken=${encodeURIComponent(authToken)}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred during authentication', error });
  }
});

export default router;