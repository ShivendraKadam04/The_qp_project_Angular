import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { QuranService } from '../../services/quran.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router, NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chapters',
  standalone: false,
  templateUrl: './chapters.component.html',
  styleUrls: ['./chapters.component.css']
})
export class ChaptersComponent implements AfterViewInit {
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

  @ViewChild('verseContainer') verseContainer!: ElementRef;

  constructor(
    private quranService: QuranService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private notification: NzNotificationService,
    private router: Router,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.collectionForm = this.fb.group({
      collectionName: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  isCollapsed = false;

  onBreakpoint(broken: boolean) {
    this.isCollapsed = broken;
  }

  toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
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
        this.isCollectionModalVisible = true; // Reopen collection modal after creation
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
    if (!this.userId) {
      console.log('User not logged in. Please log in to create a collection.');
      return;
    }

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { surahNo: number; verseNo?: number };
    if (state) {
      this.targetVerseNo = state.verseNo || null;
    }

    this.fetchQuranData();
    this.fetchCollections();
  }

  ngAfterViewInit() {
    if (this.targetVerseNo) {
      this.scrollToVerse(this.targetVerseNo);
    }
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
    this.quranService.getQuranData(this.selectedLanguage).subscribe(
      (response) => {
        if (response.success) {
          this.quranData = response.data;
          this.quranData.forEach(surah => {
            surah.verses.forEach((verse: { versesText: string }) => {
              verse.versesText = verse.versesText.replace(/(\d+)/g, '<sup>$1</sup>');
            });
          });
          this.loading = false;

          const navigation = this.router.getCurrentNavigation();
          const state = navigation?.extras.state as { surahNo: number; verseNo?: number };
          if (state?.surahNo) {
            this.selectSurahByNumber(state.surahNo);
          } else if (this.quranData.length > 0) {
            this.selectSurah(this.quranData[0]);
          }
        }
      },
      (error) => {
        this.loading = false;
        console.error('Error fetching Quran data:', error);
      },
      () => {
        const state = history.state as { surahNo: number; verseNo?: number };
        if (state?.surahNo) {
          this.selectSurahByNumber(state.surahNo);
        }
      }
    );
  }

  selectSurahByNumber(surahNo: number) {
    const surah = this.quranData.find(s => s.surahNo === surahNo);
    if (surah) {
      this.selectSurah(surah);
      this.cdr.detectChanges();
    } else {
      console.warn(`Surah with number ${surahNo} not found`);
    }
  }

  selectSurah(surah: any) {
    this.selectedSurah = surah;
    this.cdr.detectChanges();
    if (this.targetVerseNo) {
      this.scrollToVerse(this.targetVerseNo);
    }
  }

  scrollToVerse(verseNo: number) {
    if (verseNo === 0) {
      console.warn('Verse 0 is not displayed');
      return;
    }
    setTimeout(() => {
      const verseElement = this.verseContainer?.nativeElement.querySelector(`#verse-${verseNo}`);
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.error(`Verse ${verseNo} not found in the DOM.`);
      }
    }, 1000);
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