import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

// NOTE: No firebase imports at top-level on purpose (iOS Safari stability)
type FirebaseAuth = any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  // ✅ Lazy-loaded auth instance (created only when needed)
  private firebaseAuth: FirebaseAuth | null = null;

  // ✅ Prevent redirect loops
  private readonly redirectHandledKey = 'google_redirect_handled_v2';

  constructor(private http: HttpClient) {}

  // -----------------------------
  // Normal APIs (same as yours)
  // -----------------------------

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  async guestLogin(): Promise<any> {
    try {
      return await firstValueFrom(this.http.post(`${this.apiUrl}/auth/guest-login`, {}));
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

  // -----------------------------
  // ✅ iOS helpers
  // -----------------------------

  private isIosSafari(): boolean {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    return isIOS && isSafari;
  }

  /**
   * ✅ Create auth only when needed (prevents iOS boot crash)
   * Also sets "safe" persistence.
   */
  private async ensureFirebaseAuth(): Promise<any> {
    if (this.firebaseAuth) return this.firebaseAuth;

    const firebaseAppMod = await import('firebase/app');
    const firebaseAuthMod = await import('firebase/auth');

    const { getApps, initializeApp } = firebaseAppMod;
    const {
      getAuth,
      setPersistence,
      browserSessionPersistence,
      inMemoryPersistence,
    } = firebaseAuthMod;

    // ✅ avoid duplicate init
    const app = getApps().length ? getApps()[0] : initializeApp(environment.firebase);

    const auth = getAuth(app);

    // ✅ iOS Safari: session/in-memory persistence is safer than local (IndexedDB issues)
    try {
      await setPersistence(auth, this.isIosSafari() ? inMemoryPersistence : browserSessionPersistence);
    } catch (e) {
      // Even if persistence fails, keep going
      console.log('Persistence set failed (safe to ignore):', e);
    }

    this.firebaseAuth = auth;
    return auth;
  }

  // -----------------------------
  // ✅ Google login (iOS safe)
  // -----------------------------

  /**
   * Call ONLY from a button click.
   */
  async googleLogin(): Promise<any> {
    try {
      const auth = await this.ensureFirebaseAuth();

      const firebaseAuthMod = await import('firebase/auth');
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = firebaseAuthMod;

      const provider = new GoogleAuthProvider();

      // ✅ iOS Safari: Redirect
      if (this.isIosSafari()) {
        sessionStorage.removeItem(this.redirectHandledKey);
        await signInWithRedirect(auth, provider);
        return;
      }

      // ✅ Others: Popup
      const result = await signInWithPopup(auth, provider);
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
   * Call ONCE when app starts (AppComponent ngOnInit)
   */
  async handleGoogleRedirectOnce(): Promise<void> {
    try {
      if (sessionStorage.getItem(this.redirectHandledKey) === 'true') return;
      sessionStorage.setItem(this.redirectHandledKey, 'true');

      const auth = await this.ensureFirebaseAuth();
      const firebaseAuthMod = await import('firebase/auth');
      const { getRedirectResult } = firebaseAuthMod;

      const result = await getRedirectResult(auth);
      if (!result?.user) return;

      const idToken = await result.user.getIdToken();

      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/auth/firebase-google-auth`, { idToken })
      );

      // If backend returns a token, store it
      if (res?.token) sessionStorage.setItem('authToken', res.token);
      sessionStorage.setItem('isGoogleUser', 'true');

      // optional:
      // sessionStorage.removeItem(this.redirectHandledKey);
    } catch (e) {
      console.error('handleGoogleRedirectOnce failed:', e);
      // keep flag to prevent loops
    }
  }

  // -----------------------------
  // Session helpers (same)
  // -----------------------------

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
    const token = this.getToken();
    if (!token) throw new Error('No token available');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return await firstValueFrom(this.http.delete(`${this.apiUrl}/auth/delete-guest`, { headers }));
  }

  async logout(): Promise<void> {
    if (sessionStorage.getItem('isGuest') === 'true') {
      try {
        await this.deleteGuestUser();
      } catch (e) {
        console.error('Failed to delete guest user on logout:', e);
      }
    }

    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('isGoogleUser');
    sessionStorage.removeItem('isGuest');
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
