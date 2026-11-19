import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Remembers which Quran language a logged-in user chose, so the header search and
 * the reader agree. Guests always search the English text.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private cache: { userId: string; lang: string } | null = null;

  constructor(private authService: AuthService) {}

  /** Called by the reader whenever the language is loaded from / changed on the account. */
  remember(lang: string) {
    const userId = this.authService.getUserId();
    if (userId && this.authService.hasAccount()) this.cache = { userId, lang };
  }

  /** Language the header search should use right now. */
  searchLanguage(): Observable<string> {
    const userId = this.authService.getUserId();
    // Language switching is admin-only for now; everyone else searches English.
    if (!userId || !this.authService.hasAccount() || !this.authService.isAdmin()) return of('english');
    if (this.cache?.userId === userId) return of(this.cache.lang);

    return this.authService.getPreferredLanguage().pipe(
      map(res => res?.language || 'english'),
      catchError(() => of('english')),
      tap(lang => (this.cache = { userId, lang }))
    );
  }
}
