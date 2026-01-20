import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'quran-angular-app';
   constructor(private authService: AuthService) {}

  @HostListener('window:beforeunload', ['$event'])
  async onBeforeUnload(event: Event) {
    if (sessionStorage.getItem('isGuest') === 'true') {
      try {
        await this.authService.deleteGuestUser();
      } catch (error) {
        console.error('Failed to delete guest user on tab close:', error);
        // Rely on backend cleanup (sessionExpiresAt)
      }
    }
  }
}
