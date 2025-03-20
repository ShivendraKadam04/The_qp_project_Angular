import { Component } from '@angular/core';
import { QuranService } from '../../services/quran.service';
import { ChangeDetectorRef } from '@angular/core';

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

  constructor(private quranService: QuranService,private cdr: ChangeDetectorRef,) {}

  ngOnInit() {
    this.fetchQuranData();
  }

  // Fetch Quran data based on selected language
  fetchQuranData() {
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
         
        }
      },
      (error) => {
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
  console.log("Clicked Verse:", verse); // Debugging output
  this.selectedFootnotes = verse.footnotes || []; // Get footnotes from the clicked verse
  this.selectedVerseNumber = verse.versesNo; // Store the verse number for display
  this.isFootnoteModalVisible = true;

  console.log("Selected Footnotes:", this.selectedFootnotes); // Debugging output
  this.cdr.detectChanges(); // Force Angular to update UI
}

closeFootnoteModal() {
    this.isFootnoteModalVisible = false;
    this.selectedFootnotes = [];
    this.selectedVerseNumber = null;
}


}
