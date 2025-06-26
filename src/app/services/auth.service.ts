import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private firebaseAuth;

  constructor(private http: HttpClient) {
    const app = initializeApp(environment.firebase);
    this.firebaseAuth = getAuth(app);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }
async guestLogin(): Promise<any> {
    try {
      return await this.http.post(`${this.apiUrl}/auth/guest-login`, {}).toPromise();
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
    const token = this.getToken(); // Retrieve token from sessionStorage
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // Attach token
    });
  
    return this.http.post(`${this.apiUrl}/auth/update-password`, requestBody, { headers });
  }
  
  

  async googleLogin(): Promise<any> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.firebaseAuth, provider);
      const idToken = await result.user.getIdToken(); // Get Firebase ID Token

      // Send token to backend for verification
      return this.http.post(`${this.apiUrl}/auth/firebase-google-auth`, { idToken }).toPromise();
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  // Method to decode token and get id and role
  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  // Method to get user ID
  getUserId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.id || null;
  }

  // Method to get user role
  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.userRole || null;
  }

  // Method to check if the user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

    async deleteGuestUser(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token available');
      }
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
      return await this.http.delete(`${this.apiUrl}/auth/delete-guest`, { headers }).toPromise();
    } catch (error) {
      console.error('Delete guest user failed:', error);
      throw error;
    }
  }

  // Method to log out
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
  }

  // Function to decode JWT
  private decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

}
