import { Component } from '@angular/core';
import { QuranService } from '../../services/quran.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message'; // Import NzMessageService
import { NzNotificationService } from 'ng-zorro-antd/notification'; // Import NzNotificationService
@Component({
  selector: 'app-chapters',
  standalone: false,
  templateUrl: './chapters.component.html',
  styleUrl: './chapters.component.css'
})
export class ChaptersComponent {

  quranData: any[] = []; // Holds all Surahs
  selectedSurah: any = 'null'; // Holds the selected Surah details
  selectedLanguage: string = 'english'; // Default language
  userId: any;
collections: string[] = []; // Holds the list of collection names
  isCollectionModalVisible = false; // Controls modal visibility
  selectedVerse: any = null;
  constructor(private quranService: QuranService,private cdr: ChangeDetectorRef,private authService: AuthService,private notification: NzNotificationService) {}

    ngOnInit() {
      this.userId = this.authService.getUserId();
      if (!this.userId) {
        console.log('User not logged in. Please log in to create a collection.');
        return;
      }
      this.fetchQuranData();
  this.fetchCollections();
      

    }

  fetchCollections() {
    this.quranService.getFavoriteVerses(this.userId, this.selectedLanguage).subscribe({
      next: (response) => {
        
          // Assuming response.data contains collections with their names
          this.collections = response.data.map((collection: any) => collection.collectionName);
          console.log('Fetched Collections:', this.collections);
      
      },
      error: (error) => {
        console.error('Error fetching collections:', error);
      },
      complete: () => {
        console.log('Fetching collections completed'); // Optional: Add if you need to handle completion
      }
    });
  }
    

  openCollectionModal(verse: any) {
    this.selectedVerse = verse;
    this.isCollectionModalVisible = true;
  }

  // Close the collection modal
  closeCollectionModal() {
    this.isCollectionModalVisible = false;
    this.selectedVerse = null;
  }

  // Save verse to the selected collection
saveToCollection(collectionName: string) {
  if (!this.selectedVerse || !this.selectedSurah) {
    console.error('Selected verse or surah is not defined');
    this.notification.create(
      'error',
      'Error',
      'Selected verse or surah is not defined'
    );
    return;
  }

  const payload = {
    userId: this.userId,
    lang: this.selectedLanguage,
    surahNo: this.selectedSurah.surahNo,
    versesNo: this.selectedVerse.versesNo,
    collectionName: collectionName
  };
  console.log('Payload for saveVerseToCollection:', payload);

  const subscription = this.quranService
    .saveVerseToCollection(
      this.userId,
      this.selectedLanguage,
      this.selectedSurah.surahNo,
      this.selectedVerse.versesNo,
      collectionName
    )
    .subscribe({
      next: (response) => {
      
          this.notification.create(
            'success',
            'Success',
            `Verse added to ${collectionName} successfully`
          );
          this.closeCollectionModal();
       
       
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Failed to add verse to collection';
        if (errorMessage === 'This verse is already in the collection') {
          this.notification.create(
            'warning',
            'Warning',
            'This verse is already in the collection'
          );
        } else {
          this.notification.create(
            'error',
            'Error',
            errorMessage
          );
        }
        this.closeCollectionModal();
      }
    });
}
  loading:boolean = false
  // Fetch Quran data based on selected language
  fetchQuranData() {
    this.loading = true
    this.quranService.getQuranData(this.selectedLanguage).subscribe(
      (response) => {
        if (response.success) {
          this.quranData = response.data;
          console.log("Fetched Quran Data:", this.quranData);
          this.quranData.forEach(surah => {
            surah.verses.forEach((verse: { versesText: string; }) => {
              verse.versesText = verse.versesText.replace(/(\d+)/g, "<sup>$1</sup>");
            });
          });
          this.loading = false

          // Automatically select the first Surah
          if (this.quranData.length > 0) {
            this.selectSurah(this.quranData[0]);
          }
        }
      },
      (error) => {
        this.loading = false

        console.error('Error fetching Quran data:', error);
      }
    );
  }


  
  
  

  playAudio(audioUrl: string) {

    const audio = new Audio(audioUrl);
    audio.play();
  }
  // Select a Surah to display its verses
  selectSurah(surah: any) {
    this.selectedSurah = surah;
    
  }

  // Change language and fetch new data
  changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.fetchQuranData();
  }

  isFootnoteModalVisible = false;
selectedFootnotes: any[] = [];
selectedVerseNumber: number | null = null; // Store the selected verse number

openFootnoteModal(verse: any) {
  if (verse.footnotes && verse.footnotes.length > 0) {
    this.selectedFootnotes = verse.footnotes;
  }
}

closeFootnoteModal() {
    this.isFootnoteModalVisible = false;
    this.selectedFootnotes = [];
    this.selectedVerseNumber = null;
}


}
