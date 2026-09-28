import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { QuranService } from '../../services/quran.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-quran',
  standalone: false,
  templateUrl: './quran.component.html',
  styleUrl: './quran.component.css'
})
export class QuranComponent implements OnInit, OnDestroy {
  @ViewChild('pageSurface') pageSurface?: ElementRef<HTMLElement>;

  drawerOpen = false;
  userId: any;
  userRole: any;
  Username: any;
  userdata: any;
  file: any;
  firstName: any;
  lastName: any;
  searchQuery: string = '';
  searchSuggestions: { text: string; surahNo: number; verseNo?: number }[] = [];
  quranData: any[] = [];
  private quranDataRequested = false;
  private routerSub?: Subscription;

  // Rendering thousands of autocomplete rows freezes the page on short queries.
  private readonly maxSuggestions = 50;

  readonly moreLinks: { label: string; icon: string; href?: string; route?: string }[] = [
    { label: 'Order Free Copy', icon: 'book', href: 'https://www.quranproject.org/The-Quran-Project-1-p' },
    { label: 'Make a Donation', icon: 'heart', href: 'https://www.quranproject.org/donations' },
    { label: 'Download PDF', icon: 'download', href: 'https://www.quranproject.org/go_files/pdf/Online-Version-9th-Edition.pdf' },
    { label: 'Feedback', icon: 'message', route: 'feedback' },
    { label: 'Play Store - Android', icon: 'google', href: 'https://play.google.com/store/apps/details?id=com.thequranproject' },
    { label: 'iOS - Apple', icon: 'apple', href: 'https://apps.apple.com/in/app/quran-project/id525443558' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private quranService: QuranService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();
    this.Username = sessionStorage.getItem('userName');

    if (this.userId) this.fetchUserByUserId();
    // The Quran text is only needed for search; it is fetched on first search input
    // instead of on every page load.

    // New page: close the mobile drawer and start at the top of the page.
    // Fragment-only changes (appendix in-page links) keep their scroll position.
    let lastUrl = this.router.url.split('#')[0];
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.drawerOpen = false;
        const url = event.urlAfterRedirects.split('#')[0];
        if (url !== lastUrl) this.pageSurface?.nativeElement.scrollTo({ top: 0 });
        lastUrl = url;
      });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  closeDrawer() {
    this.drawerOpen = false;
  }

  get isLoggedIn(): boolean {
    return this.userRole != null && this.userRole !== 'guestuser';
  }

  get initials(): string {
    if (!this.isLoggedIn) return 'GS';
    return ((this.firstName?.charAt(0) || '') + (this.lastName?.charAt(0) || '')).toUpperCase() || 'U';
  }

  get displayName(): string {
    return this.userRole == null ? 'Profile' : (this.Username || this.firstName || 'Profile');
  }

  fetchUserByUserId() {
    this.authService.fetchUserByUserId(this.userId!).subscribe({
      next: async (res: any) => {
        this.userdata = res.user;
        this.file = this.userdata.profilePhoto;
        this.firstName = this.userdata.firstName;
        this.lastName = this.userdata.lastName;
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      },
    });
  }

  fetchQuranData() {
    if (this.quranDataRequested) return;
    this.quranDataRequested = true;
    this.quranService.getQuranData('english').subscribe({
      next: (response) => {
        if (response.success) {
          this.quranData = response.data;
          // Re-run the search for whatever was typed while the data was loading.
          if (this.searchQuery.length >= 2) this.onSearchChange(this.searchQuery);
        }
      },
      error: (error) => {
        this.quranDataRequested = false;
        console.error('Error fetching Quran data:', error);
      }
    });
  }

onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSuggestions = [];

    if (query.length < 2) return;
    if (!this.quranData.length) {
      this.fetchQuranData();
      return;
    }

    const lowerQuery = query.toLowerCase();
    const suggestions: { text: string; surahNo: number; verseNo?: number }[] = [];

    for (const surah of this.quranData) {
      if (suggestions.length >= this.maxSuggestions) break;
      if (!surah || !surah.surahName || !surah.verses) continue;

      if (surah.surahName.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: `${surah.surahNo}. ${surah.surahName}`,
          surahNo: surah.surahNo
        });
      }

      for (const verse of surah.verses) {
        if (suggestions.length >= this.maxSuggestions) break;
        if (!verse || !verse.versesText) continue;

        const verseText = verse.versesText.replace(/<[^>]+>/g, '');
        const verseNoString = verse.versesNo != null ? verse.versesNo.toString() : '';
        if (
          verseNoString.includes(lowerQuery) ||
          verseText.toLowerCase().includes(lowerQuery)
        ) {
          suggestions.push({
            text: `${surah.surahNo}. ${surah.surahName} - Verse ${verse.versesNo || 'N/A'}: ${verseText.substring(0, 50)}...`,
            surahNo: surah.surahNo,
            verseNo: verse.versesNo
          });
        }
      }
    }

    this.searchSuggestions = suggestions;
  }

  selectSuggestion(suggestion: { text: string; surahNo: number; verseNo?: number }) {
    const currentRoute = this.router.url;
    if (currentRoute.includes('/quran/chapters')) {
      // If already in ChaptersComponent, trigger search locally
      this.searchService.triggerSearch(suggestion.surahNo, suggestion.verseNo);
    } else {
      // Navigate to ChaptersComponent
      this.router.navigate(['/quran/chapters'], {
        state: { surahNo: suggestion.surahNo, verseNo: suggestion.verseNo }
      });
    }
    // Deferred: the autocomplete writes the picked option into the input right after
    // this handler runs, so clearing synchronously would be overwritten.
    setTimeout(() => {
      this.searchQuery = '';
      this.searchSuggestions = [];
    });
  }

  logout() {
    this.drawerOpen = false;
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}