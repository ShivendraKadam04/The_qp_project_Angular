import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router'; 
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  loading = false;
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
        this.loading = false;
      },
      error: (response) => {
        console.error('Login failed', response.error.message);
        this.message.error(response.error.message);

        this.loading = false;
      }
    });
  }


  async onGoogleLogin() {
    this.loading = true;
    try {
      const response: any = await this.authService.googleLogin();
      this.message.success(response.message);
      console.log('Response:', response);

      // Store JWT in sessionStorage
      sessionStorage.setItem('authToken', response.token);

      // Redirect user after successful login
      this.router.navigate(['/quran']);
    } catch (error) {
      this.message.error('Google login failed');
    } finally {
      this.loading = false;
    }
  }

  get f() {
    return this.loginForm.controls;
  }

}
