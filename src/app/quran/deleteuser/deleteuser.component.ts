import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deleteuser',
  standalone: false,
  templateUrl: './deleteuser.component.html',
  styleUrl: './deleteuser.component.css'
})
export class DeleteuserComponent {
  forgotForm: FormGroup;

  loading = false;
  submitted = false;
  isSendOtpVisible = true;
  isVerifyOtpVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.forgotForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.generateOtpForAccountDeletion(this.forgotForm.value).subscribe({
      next: (response) => {
        this.message.success(response.message);
        this.loading = false;
        this.isSendOtpVisible = false;
        this.isVerifyOtpVisible = true;
      },
      error: (response) => {
        this.message.error(response.error?.message || 'Failed to send OTP');
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

    this.authService.verifyOtpAndDeleteAccount(payload).subscribe({
      next: (response) => {
        this.message.success(response.message || 'Account has been permanently deleted');
        this.loading = false;

        // ──────────────────────────────────────────────
        // Clean up authentication state
        // ──────────────────────────────────────────────
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('isGoogleUser');
        localStorage.removeItem('authToken');     // if you ever used localStorage
        localStorage.removeItem('user');          // common extra key
        // Add any other tokens/keys your app uses

        // ──────────────────────────────────────────────
        // Navigate + force full reload
        // ──────────────────────────────────────────────
        this.router.navigate(['/dashboard']).then(() => {
          // Force full page refresh to reset app state completely
          window.location.reload();
        });
      },  
      error: (response) => {
        this.message.error(response.error?.message || 'Verification failed');
        this.loading = false;
      }
    });
  }
}