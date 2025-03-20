import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  fetchUserByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/users/${userId}`);
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

  // Method to log out
  logout(): void {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
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
