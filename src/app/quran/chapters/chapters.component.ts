import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { QuranService } from '../../services/quran.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from '../../services/search.service';
@Component({
  selector: 'app-chapters',
  standalone: false,
  templateUrl: './chapters.component.html',
  styleUrls: ['./chapters.component.css']
})
export class ChaptersComponent implements OnInit, OnDestroy {
  quranData: any[] = [];
  selectedSurah: any = null;
  selectedLanguage: string = 'english';
  userId: any;
  collections: string[] = [];
  isCollectionModalVisible = false;
  isModalVisible = false;
  selectedVerse: any = null;
  loading: boolean = false;
  targetVerseNo: number | null = null;
  userRole: any;
  lang = 'english';
  collectionForm: FormGroup;
  highlightedVerse: number | null = null; // Track the highlighted verse
  surahListOpen = false; // Slide-in surah list on tablets / phones
  surahFilter = '';
  private highlightTimer?: ReturnType<typeof setTimeout>;
  private initialState: { surahNo?: number; verseNo?: number } | null = null;
  private destroy$ = new Subject<void>();

  @ViewChild('verseContainer') verseContainer!: ElementRef;

  constructor(
    private quranService: QuranService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private notification: NzNotificationService,
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService,
    private searchService: SearchService
  ) {
    this.collectionForm = this.fb.group({
      collectionName: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Surah / verse picked from the header search on another page.
    this.initialState = (this.router.getCurrentNavigation()?.extras.state ?? history.state) as any;
  }

  get filteredSurahs(): any[] {
    const q = this.surahFilter.trim().toLowerCase();
    if (!q) return this.quranData;
    return this.quranData.filter(s =>
      String(s.surahNo) === q || s.surahName?.toLowerCase().includes(q)
    );
  }

  get isFirstSurah(): boolean {
    return !this.selectedSurah || this.quranData.indexOf(this.selectedSurah) <= 0;
  }

  get isLastSurah(): boolean {
    return !this.selectedSurah || this.quranData.indexOf(this.selectedSurah) >= this.quranData.length - 1;
  }

  goToAdjacentSurah(offset: number) {
    const next = this.quranData[this.quranData.indexOf(this.selectedSurah) + offset];
    if (next) this.onSurahClick(next);
  }

  trackBySurah = (_: number, surah: any) => surah.surahNo;
  trackByVerse = (_: number, verse: any) => verse.versesNo;

  handleSearch(surahNo: number, verseNo?: number) {
    const surah = this.quranData.find(s => s.surahNo === surahNo);
    if (surah) {
      this.surahListOpen = false;
      this.selectSurah(surah);
      if (verseNo) {
        this.scrollToVerse(verseNo);
      } else {
        this.scrollContentToTop();
      }
    } else {
      this.message.error(`Surah ${surahNo} not found`);
    }
  }

  toggleSurahList() {
    this.surahListOpen = !this.surahListOpen;
  }

  openCreateCollectionModal(): void {
    this.isModalVisible = true;
    this.isCollectionModalVisible = false;
  }

  submitCollection(): void {
    if (this.collectionForm.invalid || !this.userId) {
      this.message.error('Please fill all required fields.');
      return;
    }

    const { collectionName } = this.collectionForm.value;
    this.quranService.createCollection(this.userId, this.lang, collectionName).subscribe({
      next: (res: { message: any }) => {
        this.message.success(res.message || 'Collection created successfully');
        this.collectionForm.reset({ lang: 'en' });
        this.isModalVisible = false;
        this.isCollectionModalVisible = true;
        this.fetchCollections();
      },
      error: (err: { error: { message: any } }) => {
        this.message.error(err.error?.message || 'Failed to create collection.');
      }
    });
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.collectionForm.reset();
  }

ngOnInit() {
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();

    // Header search while already on this page (works for guests too).
    this.searchService.search$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ surahNo, verseNo }) => this.handleSearch(surahNo, verseNo));

    this.fetchQuranData();
    if (this.userId) this.fetchCollections();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.highlightTimer);
  }

  fetchCollections() {
     
    this.quranService.getFavoriteVerses(this.userId, this.selectedLanguage).subscribe({
      next: (response) => {
        this.collections = response.data.map((collection: any) => collection.collectionName);
        console.log('Fetched Collections:', this.collections);
      },
      error: (error) => {
        console.error('Error fetching collections:', error);
      }
    });
  }

openCollectionModal(verse: any) {
  // Check if user is logged in (userId exists AND userRole is not null/guest)
  if (!this.userId || this.userRole == null || this.userRole === 'guestuser') {
    this.message.error('Please log in to save verses to your collection.');
    return;
  }

  // If user is logged in → proceed normally
  if (!this.collections.length) this.fetchCollections();
  this.selectedVerse = verse;
  this.isCollectionModalVisible = true;
}

  closeCollectionModal() {
    this.isCollectionModalVisible = false;
    this.selectedVerse = null;
  }

  saveToCollection(collectionName: string) {
    if (!this.selectedVerse || !this.selectedSurah) {
      this.notification.create('error', 'Error', 'Selected verse or surah is not defined');
      return;
    }

    const payload = {
      userId: this.userId,
      lang: this.selectedLanguage,
      surahNo: this.selectedSurah.surahNo,
      versesNo: this.selectedVerse.versesNo,
      collectionName: collectionName
    };

    this.quranService
      .saveVerseToCollection(
        this.userId,
        this.selectedLanguage,
        this.selectedSurah.surahNo,
        this.selectedVerse.versesNo,
        collectionName
      )
      .subscribe({
        next: (response) => {
          this.notification.create('success', 'Success', `Verse added to ${collectionName} successfully`);
          this.closeCollectionModal();
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Failed to add verse to collection';
          if (errorMessage === 'This verse is already in the collection') {
            this.notification.create('warning', 'Warning', 'This verse is already in the collection');
          } else {
            this.notification.create('error', 'Error', errorMessage);
          }
          this.closeCollectionModal();
        }
      });
  }

  fetchQuranData() {
    this.loading = true;
    this.quranService.getQuranData(this.selectedLanguage).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.loading = false;
        if (!response.success) return;

        // Copy instead of mutating: the response is cached and shared with search,
        // and mutating it would wrap the numbers in <sup> again on every visit.
        this.quranData = response.data.map((surah: any) => ({
          ...surah,
          verses: (surah.verses || []).map((verse: any) => ({
            ...verse,
            footnotes: verse.footnotes || [],
            versesText: (verse.versesText || '').replace(/(\d+)/g, '<sup>$1</sup>')
          }))
        }));

        const target = this.initialState?.surahNo
          ? this.quranData.find(s => s.surahNo === this.initialState!.surahNo)
          : this.quranData.find(s => s.surahNo === this.selectedSurah?.surahNo);
        const verseNo = this.initialState?.verseNo;
        this.initialState = null;

        if (target || this.quranData.length) this.selectSurah(target || this.quranData[0]);
        if (target && verseNo) this.scrollToVerse(verseNo);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching Quran data:', error);
        this.message.error('Could not load the Qur\'an. Please check your connection and try again.');
      }
    });
  }

  selectSurahByNumber(surahNo: number) {
    const surah = this.quranData.find(s => s.surahNo === surahNo);
    if (surah) {
      this.selectSurah(surah);
      console.log('Selected surah:', surah.surahNo, surah.surahName);
      this.cdr.detectChanges();
    } else {
      console.warn(`Surah with number ${surahNo} not found`);
    }
  }
  @ViewChild('contentContainer', { read: ElementRef }) contentContainer!: ElementRef<HTMLElement>;

  onSurahClick(surah: any) {
    this.surahListOpen = false;
    this.selectSurah(surah);
    this.scrollContentToTop();
  }

  selectSurah(surah: any) {
    this.selectedSurah = surah;
    this.cdr.detectChanges();
  }

  private scrollContentToTop() {
    // Timeout so the new verses have rendered before resetting the scroll.
    setTimeout(() => this.contentContainer?.nativeElement.scrollTo({ top: 0 }), 0);
  }

 
splitIntroduction(text: string): string[] {
  if (!text) return [];
  
  // Replace literal "/n" and actual "\n" with real newlines, then split
  return text
    .replace(/\/n/g, '\n')        // Replace "/n" → actual newline
    .replace(/\\n/g, '\n')        // In case it's escaped as \\n
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0); // Remove empty lines
}

scrollToVerse(verseNo: number) {
    if (verseNo === 0) {
      console.warn('Verse 0 is not displayed');
      return;
    }
    clearTimeout(this.highlightTimer);
    this.highlightedVerse = verseNo;
    setTimeout(() => {
      const verseElement = this.verseContainer?.nativeElement.querySelector(`#verse-${verseNo}`);
      if (!verseElement) {
        console.error(`Verse ${verseNo} not found in the DOM. Check if #verse-${verseNo} exists.`);
        return;
      }
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightTimer = setTimeout(() => {
        this.highlightedVerse = null;
        this.targetVerseNo = null;
        this.cdr.detectChanges();
      }, 2500);
    }, 300);
  }

  playAudio(audioUrl: string) {
    const audio = new Audio(audioUrl);
    audio.play();
  }

  changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.fetchQuranData();
  }

  isFootnoteModalVisible = false;
  selectedFootnotes: any[] = [];
  selectedVerseNumber: number | null = null;

  openFootnoteModal(verse: any) {
    if (verse.footnotes && verse.footnotes.length > 0) {
      this.selectedFootnotes = verse.footnotes;
      this.isFootnoteModalVisible = true;
    }
  }

  closeFootnoteModal() {
    this.isFootnoteModalVisible = false;
    this.selectedFootnotes = [];
    this.selectedVerseNumber = null;
  }
}