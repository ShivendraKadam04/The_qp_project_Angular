import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-quran',
  standalone: false,
  templateUrl: './quran.component.html',
  styleUrl: './quran.component.css'
})
export class QuranComponent {
  isCollapsed = false;
  userId: any;
    userRole : any;
    Username : any;
    userdata : any;
    file : any;
    firstName : any;
    lastName : any;
  constructor(private authService: AuthService,private router: Router) {}

  logout(){
    this.authService.logout()
    this.router.navigate(['/auth'])
  }
  async fetchUserByUserId() {
    await this.authService.fetchUserByUserId(this.userId!).subscribe({
      next: async (res: any) => {
        this.userdata = res.user; // Access the user object from the response
        this.file = this.userdata.profilePhoto; // Base64 string for profile photo
        this.firstName = this.userdata.firstName;
        this.lastName = this.userdata.lastName;
        console.log('User Data:', this.userdata);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      },
    });
  }
  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();
    this.Username = sessionStorage.getItem('userName');
    this.fetchUserByUserId()
    console.log('User ID:', this.userId, 'Role:', this.userRole);
  }
  
}
