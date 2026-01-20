import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getAuth,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // ✅ Firebase init (keep like this for now)
  private firebaseAuth = getAuth(initializeApp(environment.firebase));

  // ✅ Prevent redirect-result infinite loop (iOS)
  private readonly redirectHandledKey = 'google_redirect_handled_v1';

  constructor(private http: HttpClient) {}

  // ------------------------------
  // Normal Auth APIs (unchanged)
  // ------------------------------

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  async guestLogin(): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/guest-login`, {})
      );
    } catch (error) {
      console.error('Guest login failed:', error);
      throw error;
    }
  }

  generateOtpForPasswordReset(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/generate-otp-for-password-reset`, credentials);
  }

  verifyOtpForPasswordReset(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-otp-for-password-reset`, formData);
  }

  resetPasswordViaOtp(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/update-password-otp`, formData);
  }

  fetchUserByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/users/${userId}`);
  }

  updateUserProfile(userId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/update-profile`, formData);
  }

  updateUserAddress(addressData: any) {
    return this.http.post(`${this.apiUrl}/auth/update-address`, addressData);
  }

  changePassword(requestBody: any): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/auth/update-password`, requestBody, { headers });
  }

  // ------------------------------
  // ✅ Google Login (iOS Safe)
  // ------------------------------

  private isIosSafari(): boolean {
    const ua = navigator.userAgent;

    // iOS device?
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    // Safari on iOS (exclude Chrome/Firefox/Edge on iOS)
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

    return isIOS && isSafari;
  }

  /**
   * ✅ Call ONLY on user click
   * - iOS Safari => redirect
   * - Others => popup
   */
  async googleLogin(): Promise<any> {
    try {
      const provider = new GoogleAuthProvider();

      // ✅ iOS Safari: use redirect (popup can crash/loop)
      if (this.isIosSafari()) {
        // clear the handled flag so next load can process redirect result once
        sessionStorage.removeItem(this.redirectHandledKey);

        await signInWithRedirect(this.firebaseAuth, provider);
        return; // redirect happens
      }

      // ✅ Other browsers: popup is fine
      const result = await signInWithPopup(this.firebaseAuth, provider);
      const idToken = await result.user.getIdToken();

      return await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/firebase-google-auth`, { idToken })
      );
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  /**
   * ✅ Call ONCE when app starts (AppComponent)
   * This will finish Google redirect flow on iOS Safari.
   */
  async handleGoogleRedirectOnce(): Promise<void> {
    try {
      // ✅ Prevent infinite loops
      if (sessionStorage.getItem(this.redirectHandledKey) === 'true') return;
      sessionStorage.setItem(this.redirectHandledKey, 'true');

      const result = await getRedirectResult(this.firebaseAuth);

      // If user didn't just come from redirect, nothing to do
      if (!result || !result.user) return;

      const idToken = await result.user.getIdToken();

      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/firebase-google-auth`, { idToken })
      );

      // ✅ If backend returns token, store it here (adjust key names if needed)
      if (res?.token) {
        sessionStorage.setItem('authToken', res.token);
      }
      if (res?.user?.userName) {
        sessionStorage.setItem('userName', res.user.userName);
      }

      // optional flags
      sessionStorage.setItem('isGoogleUser', 'true');
    } catch (e) {
      console.error('handleGoogleRedirectOnce failed:', e);
      // keep the flag so it doesn't loop forever on iOS
    }
  }

  // ------------------------------
  // Token / User Helpers (unchanged)
  // ------------------------------

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  getUserId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.id || null;
  }

  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.userRole || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  async deleteGuestUser(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No token available');

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      return await firstValueFrom(
        this.http.delete(`${this.apiUrl}/auth/delete-guest`, { headers })
      );
    } catch (error) {
      console.error('Delete guest user failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (sessionStorage.getItem('isGuest') === 'true') {
      try {
        await this.deleteGuestUser();
      } catch (error) {
        console.error('Failed to delete guest user on logout:', error);
      }
    }

    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('isGoogleUser');
    sessionStorage.removeItem('isGuest');

    // ✅ Also reset redirect flag
    sessionStorage.removeItem(this.redirectHandledKey);
  }

  private decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      return JSON.parse(decodedJson);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
