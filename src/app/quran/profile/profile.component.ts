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

  locationForm!: FormGroup;

  listCountry: any[] = [];
  listState: any[] = [];
  listCity: any[] = [];

  isStateDisabled: boolean = true;
  isCityDisabled: boolean = true;

  isFormChanged: boolean = false;
  isAddressFormChanged: boolean = false;

  selectedFile: any;

  // ✅ NEW: dynamic import cache
  private csc: any | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService
  ) {
    this.locationForm = this.fb.group({
      country: [null, Validators.required],
      state: [null, Validators.required],
      city: [null],
      streetAddress: ['', Validators.required]
    });
  }

  // ✅ NEW: load country-state-city only when needed (creates separate chunk)
  private async loadCSC() {
    if (this.csc) return this.csc;
    this.csc = await import('country-state-city');
    return this.csc;
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      userName: [''],
      gender: [''],
      profilePhoto: ['']
    });

    this.userForm.valueChanges.subscribe(() => {
      this.isFormChanged = this.userForm.dirty;
    });

    this.locationForm.valueChanges.subscribe(() => {
      this.isAddressFormChanged = this.locationForm.dirty;
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.userId = this.authService.getUserId();
    this.isGoogleUser = sessionStorage.getItem('isGoogleUser');

    this.fetchUserByUserId();

    // ✅ IMPORTANT: now async loads the lib only on Profile open
    this.loadCountries();
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

          this.locationForm.patchValue({
            country: res.user.country || null,
            state: res.user.state || null,
            city: res.user.city || null,
            streetAddress: res.user.streetAddress || ''
          });

          // If country/state exist, load dropdown values
          // NOTE: these are now async, so call without await is fine
          if (res.user.country) {
            this.onCountrySelected(res.user.country);
          }
          if (res.user.state) {
            this.onStateSelected(res.user.state);
          }
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

  // ✅ UPDATED: now async
  async loadCountries(): Promise<void> {
    try {
      const csc = await this.loadCSC();
      this.listCountry = csc.Country.getAllCountries().map((country: any) => ({
        name: country.name,
        isoCode: country.isoCode
      }));
    } catch (e) {
      console.error('Failed to load countries:', e);
      this.message.error('Failed to load country list.');
    }
  }

  // ✅ UPDATED: now async
  async onCountrySelected(countryCode: string): Promise<void> {
    try {
      const csc = await this.loadCSC();

      if (countryCode) {
        this.listState = csc.State.getStatesOfCountry(countryCode).map((state: any) => ({
          name: state.name,
          isoCode: state.isoCode
        }));

        this.isStateDisabled = false;

        this.listCity = [];
        this.isCityDisabled = true;

        // Clear previous selections (optional but safer)
        this.locationForm.patchValue({ state: null, city: null }, { emitEvent: false });
      } else {
        this.listState = [];
        this.isStateDisabled = true;
        this.listCity = [];
        this.isCityDisabled = true;

        this.locationForm.patchValue({ state: null, city: null }, { emitEvent: false });
      }
    } catch (e) {
      console.error('Failed to load states:', e);
      this.message.error('Failed to load states.');
    }
  }

  // ✅ UPDATED: now async
  async onStateSelected(stateCode: string): Promise<void> {
    try {
      const csc = await this.loadCSC();

      const countryCode = this.locationForm.get('country')?.value;

      if (stateCode && countryCode) {
        this.listCity = csc.City.getCitiesOfState(countryCode, stateCode).map((city: any) => ({
          name: city.name
        }));
        this.isCityDisabled = false;

        // Clear city selection (optional)
        this.locationForm.patchValue({ city: null }, { emitEvent: false });
      } else {
        this.listCity = [];
        this.isCityDisabled = true;
        this.locationForm.patchValue({ city: null }, { emitEvent: false });
      }
    } catch (e) {
      console.error('Failed to load cities:', e);
      this.message.error('Failed to load cities.');
    }
  }

  updateAddress() {
    if (!this.isAddressFormChanged) return;

    if (this.locationForm.invalid) {
      this.message.error('Please fill all required fields.');
      return;
    }

    const locationData = {
      id: this.authService.getUserId(),
      country: this.locationForm.value.country,
      state: this.locationForm.value.state,
      city: this.locationForm.value.city,
      streetAddress: this.locationForm.value.streetAddress
    };

    this.authService.updateUserAddress(locationData).subscribe({
      next: () => {
        this.message.success('Address updated successfully');
        this.isAddressFormChanged = false;
        this.fetchUserByUserId();
      },
      error: (err) => {
        console.error('Error updating address:', err);
        this.message.error('Failed to update address.');
      }
    });
  }
}
