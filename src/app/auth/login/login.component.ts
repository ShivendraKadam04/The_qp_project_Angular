import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
guestLoading = false;
  loading = false;
  googleloading = false;
  submitted = false;
  passwordVisible = false;

  constructor(private fb: FormBuilder, private authService: AuthService,private message: NzMessageService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  

  onSubmit() {
    this.submitted = true;

    // If the form is invalid, return early
    if (this.loginForm.invalid) {
      console.log("Form is invalid", this.loginForm.errors);
      return;
    }

    this.loading = true;
    console.log("Submitting Login form...", this.loginForm.value);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.message.success(response.message);  // Show success message
        this.router.navigate(['/quran'])
        sessionStorage.setItem('authToken', response.token);
        sessionStorage.setItem('userName', response.user.userName);
        sessionStorage.setItem('isGoogleUser', response.user.isGoogleUser);

        this.loading = false;
      },
      error: (response) => {
        console.error('Login failed', response.error.message);
        this.message.error(response.error.message);

        this.loading = false;
      }
    });
  }

  
  async onGuestLogin() {
    this.guestLoading = true;
    try {
      const response: any = await this.authService.guestLogin();
      this.message.success(response.message);
      console.log('Guest login response:', response);

      sessionStorage.setItem('authToken', response.token);
      sessionStorage.setItem('userName', response.user.userName);
      sessionStorage.setItem('userRole', response.user.userRole);
      sessionStorage.setItem('isGuest', response.user.isGuest);

      window.location.href = '/quran';

    } catch (err: any) {
      const error = err as HttpErrorResponse;
      const errorMessage = error?.error?.message || 'Guest login failed';
      console.error('Guest login failed', error);
      this.message.error(errorMessage);
    } finally {
      this.guestLoading = false;
    }
  }



  async onGoogleLogin() {
    this.googleloading = true;
    try {
      const response: any = await this.authService.googleLogin();
      this.message.success(response.message);
      console.log('Response:', response);
      
      // Store JWT in sessionStorage
      sessionStorage.setItem('authToken', response.token);
      sessionStorage.setItem('isGoogleUser', response.user.isGoogleUser);

      // Redirect user after successful login
      this.router.navigate(['/quran']);

    }  catch (err: any) {
      const error = err as HttpErrorResponse;
      let errorMessage = 'Something went wrong';

      if (error?.error?.error?.includes('E11000')) {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else {
        errorMessage = error?.error?.error || error?.error?.message || errorMessage;
      }

      console.error('Google login failed', error);
      this.message.error(errorMessage);
    } finally {
      this.googleloading = false;
    }
  }

  get f() {
    return this.loginForm.controls;
  }

}
