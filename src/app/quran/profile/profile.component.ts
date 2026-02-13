import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userForm!: FormGroup;
  passwordForm!: FormGroup;

  userId: any;
  firstName: any;
  lastName: any;
  isGoogleUser: any;

  userInitials: string = '';

  passwordVisible1 = false;
  passwordVisible2 = false;
  passwordVisible3 = false;
  passwordMismatch = false;

  selectedFile: any;

  isFormChanged: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      firstName: [{ value: '',  }],
      lastName: [{ value: '',  }],
      userName: [''],
      gender: [''],
      profilePhoto: ['']
    });

    this.userForm.valueChanges.subscribe(() => {
      this.isFormChanged = this.userForm.dirty;
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.userId = this.authService.getUserId();
    this.isGoogleUser = sessionStorage.getItem('isGoogleUser');

    this.fetchUserByUserId();
  }

  async fetchUserByUserId() {
    this.authService.fetchUserByUserId(this.userId).subscribe({
      next: (res: any) => {
        if (res?.user) {
          this.firstName = res.user.firstName || '';
          this.lastName = res.user.lastName || '';

          this.userInitials = this.getInitials(this.firstName, this.lastName);

          this.userForm.patchValue({
            email: res.user.email,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            userName: res.user.userName,
            gender: res.user.gender,
            profilePhoto: res.user.profilePhoto || ''
          });
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (
      (firstName ? firstName.charAt(0) : '') +
      (lastName ? lastName.charAt(0) : '')
    ).toUpperCase();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userForm.patchValue({ profilePhoto: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  updateUserProfile() {
    if (!this.isFormChanged) return;

    const formData = new FormData();
    formData.append('id', this.userId);
    formData.append('firstName',   this.userForm.value.firstName?.trim()   || '');
  formData.append('lastName',    this.userForm.value.lastName?.trim()    || '');
    formData.append('userName', this.userForm.value.userName);
    formData.append('gender', this.userForm.value.gender);

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.authService.updateUserProfile(this.userId, formData).subscribe({
      next: () => {
        this.message.success('Profile updated successfully');
        this.isFormChanged = false;
        this.fetchUserByUserId();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.message.error('Failed to update profile.');
      }
    });
  }

  checkPasswordMatch() {
    const newPassword = this.passwordForm.value.newPassword;
    const confirmPassword = this.passwordForm.value.confirmPassword;
    this.passwordMismatch = newPassword !== confirmPassword;
  }

  changePassword() {
    if (this.passwordMismatch) {
      this.message.error('New passwords do not match!');
      return;
    }

    const requestBody = {
      id: this.userId,
      currentPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(requestBody).subscribe({
      next: () => {
        this.message.success('Password updated successfully');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.message.error('Error changing password: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}