import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  resetPasswordForm: FormGroup;

  loading = false;
  googleloading = false;
  submitted = false;
  passwordVisible = false;
  isVerifyOtpVisible = false;
  isSendOtpVisible = true;
  isResetPasswordVisible = false;
  userId: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
    private router: Router
  ) {
    // Email form
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    // Password reset form
    this.resetPasswordForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  get r() {
    return this.resetPasswordForm.controls;
  }

  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    this.submitted = true;

    if (this.forgotForm.invalid) {
      console.log("Form is invalid", this.forgotForm.errors);
      return;
    }

    this.loading = true;

    this.authService.generateOtpForPasswordReset(this.forgotForm.value).subscribe({
      next: (response) => {
        this.message.success(response.message);
        this.loading = false;
        this.isVerifyOtpVisible = true;
        this.isSendOtpVisible = false;
      },
      error: (response) => {
        this.message.error(response.error.message);
        this.loading = false;
      }
    });
  }

  moveToNext(event: any, nextInput?: any) {
    if (event.target.value && nextInput) {
      nextInput.focus();
    }
  }

  onSubmitOtp(otpValues: string[]) {
    this.loading = true;
    if (otpValues.some(value => value === '')) {
      this.message.error('Please enter all OTP digits');
      this.loading = false;
      return;
    }

    const otp = otpValues.join('');
    const payload = {
      email: this.forgotForm.value.email,
      otp: otp
    };

    this.authService.verifyOtpForPasswordReset(payload).subscribe({
      next: (response) => {
        this.message.success(response.message);
        this.userId = response.userId;
        this.loading = false;
        this.isVerifyOtpVisible = false;
        this.isResetPasswordVisible = true;
      },
      error: (response) => {
        this.message.error(response.error.message);
        this.loading = false;
      }
    });
  }

  onResetPassword() {
  
    this.submitted = true;
  

    if (this.resetPasswordForm.invalid) {
      return;
    }

    const payload = {
      id: this.userId,
      newPassword: this.resetPasswordForm.value.password
    };

    this.loading = true;

    this.authService.resetPasswordViaOtp(payload).subscribe({
      next: (response) => {
        this.message.success('Password updated successfully!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message.error(err.error.message || 'Failed to update password');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  async onGoogleLogin() {
    this.googleloading = true;
    try {
      const response: any = await this.authService.googleLogin();
      this.message.success(response.message);
      sessionStorage.setItem('authToken', response.token);
      sessionStorage.setItem('isGoogleUser', response.user.isGoogleUser);
      this.router.navigate(['/quran']);
    } catch (error) {
      this.message.error('Google login failed');
    } finally {
      this.googleloading = false;
    }
  }
}
