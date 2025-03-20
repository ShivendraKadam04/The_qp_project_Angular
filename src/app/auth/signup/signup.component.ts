import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router'; // ✅ Import Router

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  submitted = false;
  passwordVisible = false;

  constructor(private fb: FormBuilder, private authService: AuthService,private message: NzMessageService, private router: Router) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
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

  onSubmit() {
    this.submitted = true;
    // If the form is invalid, return early
    if (this.signupForm.invalid) {
      console.log("Form is invalid", this.signupForm.errors);
      return;
    }

    this.loading = true;
    console.log("Submitting signup form...", this.signupForm.value);

    this.authService.signup(this.signupForm.value).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        this.message.success(response.message);  // Show success message
        this.router.navigate(['/auth/login'])
        this.loading = false;
      },
      error: (response) => {
        console.error('Signup failed', response.error.message);
        this.message.error(response.error.message);

        this.loading = false;
      }
    });
  }


  get f() {
    return this.signupForm.controls;
  }
}
