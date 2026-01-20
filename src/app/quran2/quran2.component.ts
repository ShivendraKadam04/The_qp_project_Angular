import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

import { QuranService } from '../services/quran.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-quran2',
  standalone: false,
  templateUrl: './quran2.component.html',
  styleUrl: './quran2.component.css'
})
export class Quran2Component {
  isCollapsed = false;
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
   
    this.fetchUserByUserId();
    this.fetchQuranData();
  }

  async fetchUserByUserId() {
    await this.authService.fetchUserByUserId(this.userId!).subscribe({
      next: async (res: any) => {
        this.userdata = res.user;
        this.file = this.userdata.profilePhoto;
        this.firstName = this.userdata.firstName;
        this.lastName = this.userdata.lastName;
        console.log('User Data:', this.userdata);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      },
    });
  }

  fetchQuranData() {
    this.quranService.getQuranData('english').subscribe({
      next: (response) => {
        if (response.success) {
          this.quranData = response.data;
          console.log('Fetched Quran Data for Search:', this.quranData);
        }
      },
      error: (error) => {
        console.error('Error fetching Quran data:', error);
      }
    });
  }

onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSuggestions = [];

    if (query.length < 2) return;

    const lowerQuery = query.toLowerCase();
    const suggestions: { text: string; surahNo: number; verseNo?: number }[] = [];

    this.quranData.forEach((surah) => {
      if (!surah || !surah.surahName || !surah.verses) return;

      if (surah.surahName.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: `${surah.surahNo}. ${surah.surahName}`,
          surahNo: surah.surahNo
        });
      }

      surah.verses.forEach((verse: any) => {
        if (!verse || !verse.versesText) return;

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
      });
    });

    this.searchSuggestions = suggestions
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
    this.searchQuery = '';
    this.searchSuggestions = [];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
