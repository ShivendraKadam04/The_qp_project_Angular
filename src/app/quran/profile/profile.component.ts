import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Country, State, City } from 'country-state-city';

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
  userInitials: string = ''; // Store user initials
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
  isFormChanged: boolean = false; // Track form changes
  isAddressFormChanged: boolean = false; // Track form changes

  constructor(private fb: FormBuilder, private authService: AuthService, private message: NzMessageService) {
    this.locationForm = this.fb.group({
      country: [null, Validators.required],
      state: [null, Validators.required],
      city: [null],
      streetAddress: ['', Validators.required] // New field added

    });
    
  }

  async fetchUserByUserId() {
    this.authService.fetchUserByUserId(this.userId).subscribe({
      next: (res: any) => {
        if (res?.user) {
          this.firstName = res.user.firstName || '';
          this.lastName = res.user.lastName || '';
  
          // Generate initials
          this.userInitials = this.getInitials(this.firstName, this.lastName);
          
          // Patch userForm
          this.userForm.patchValue({
            email: res.user.email,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            userName: res.user.userName,
            gender: res.user.gender,
            profilePhoto: res.user.profilePhoto || ''
          });
  
          // Patch locationForm
          this.locationForm.patchValue({
            country: res.user.country || null,
            state: res.user.state || null,
            city: res.user.city || null,
            streetAddress: res.user.streetAddress || ''
          });
  
          // Load states and cities based on fetched values
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

  selectedFile: any;
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Store selected file
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userForm.patchValue({ profilePhoto: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  updateUserProfile() {
    if (!this.isFormChanged) return; // Prevent unnecessary updates
    const formData = new FormData();
    formData.append('id', this.userId);
    formData.append('userName', this.userForm.value.userName);
    formData.append('gender', this.userForm.value.gender);

    // Append the selected file if a new one was chosen
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
      console.log('profilePicture', this.selectedFile);
    }
    console.log('Updated User Data:', this.userForm.value);

    this.authService.updateUserProfile(this.userId, formData).subscribe({
      next: (res) => {
        this.message.success('Profile updated successfully');
         this.isFormChanged = false; 
        this.fetchUserByUserId();
       
      },
      error: (err) => {
        console.error('Error updating profile:', err);
      }
    });
  }

  // Password Change Methods
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
      id: this.userId, // Backend expects `id`
      currentPassword: this.passwordForm.value.oldPassword, // Match backend field
      newPassword: this.passwordForm.value.newPassword
    };
  
    this.authService.changePassword(requestBody).subscribe({
      next: (res) => {
        this.message.success('Password updated successfully');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.message.error('Error changing password: ' + (err.error?.message || "Unknown error"));
      }
    });
  }
  
  loadCountries(): void {
    this.listCountry = Country.getAllCountries().map(country => ({
      name: country.name,
      isoCode: country.isoCode
    }));
  }

  onCountrySelected(countryCode: string): void {
    if (countryCode) {
      this.listState = State.getStatesOfCountry(countryCode).map(state => ({
        name: state.name,
        isoCode: state.isoCode
      }));
      this.isStateDisabled = false;
      this.listCity = [];
      this.isCityDisabled = true;
    } else {
      this.listState = [];
      this.isStateDisabled = true;
      this.listCity = [];
      this.isCityDisabled = true;
    }
  }

  onStateSelected(stateCode: string): void {
    const countryCode = this.locationForm.get('country')?.value;
    if (stateCode && countryCode) {
      this.listCity = City.getCitiesOfState(countryCode, stateCode).map(city => ({
        name: city.name
      }));
      this.isCityDisabled = false;
    } else {
      this.listCity = [];
      this.isCityDisabled = true;
    }
  }

  updateAddress() {
    if (!this.isAddressFormChanged) return; // Prevent unnecessary updates
    if (this.locationForm.invalid) {
      this.message.error('Please fill all required fields.');
      return;
    }
  
    const locationData = {
      id: this.authService.getUserId(),  // Include User ID
      country: this.locationForm.value.country,
      state: this.locationForm.value.state,
      city: this.locationForm.value.city,
      streetAddress: this.locationForm.value.streetAddress
    };
  
    this.authService.updateUserAddress(locationData).subscribe({
      next: (res) => {
        this.message.success('Address updated successfully');
        this.fetchUserByUserId()
      },
      error: (err) => {
        console.error('Error updating address:', err);
        this.message.error('Failed to update address.');
      }
    });
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
      this.isFormChanged = this.userForm.dirty; // Set true when any change occurs
    });
    this.locationForm.valueChanges.subscribe(() => {
      this.isAddressFormChanged = this.locationForm.dirty; // Set true when any change occurs
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.userId = this.authService.getUserId();
    this.fetchUserByUserId();
    this.loadCountries();
    this.isGoogleUser = sessionStorage.getItem('isGoogleUser');
   

  }
}
