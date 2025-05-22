// collection.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuranService } from '../../services/quran.service';
import { AuthService } from '../../services/auth.service';

interface Verse {
  surahNo: number;
  surahName: string;
  versesNo: number;
  versesText: string;
  audioFile: string | null;
}

interface Collection {
  collectionName: string;
  verses: Verse[];
}

@Component({
  selector: 'app-collection',
  standalone: false,
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  collectionForm!: FormGroup;
  isModalVisible = false;
  isVerseModalVisible = false; // For displaying verses in a modal
  selectedCollection: Collection | null = null; // Store the clicked collection
  collections: Collection[] = []; // Store fetched collections
  userId: string | null = null;
  lang = 'english'; // Matches API language

  constructor(
    private fb: FormBuilder,
    private quranService: QuranService,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Initialize form with default lang set to 'en'
    this.collectionForm = this.fb.group({
      collectionName: ['', [Validators.required, Validators.minLength(3)]],
     
    });

    // Get userId from AuthService
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.message.error('User not logged in. Please log in to create a collection.');
      return;
    }

    // Fetch collections
    this.fetchCollections();
  }
  collectionsLength:any

  fetchCollections(): void {
    if (this.userId) {
      this.quranService.getFavoriteVerses(this.userId, this.lang).subscribe({
        next: (res: { message: string; data: Collection[] }) => {
          this.collections = res.data;
          this.collectionsLength = this.collections.length
          console.log("this.collections",this.collections)
        },
        error: (err: { error: { message: any } }) => {
          this.message.error(err.error?.message || 'Failed to fetch collections.');
        }
      });
    }
  }

  // Show modal to create collection
  showModal(): void {
    this.isModalVisible = true;
  }

  // Handle form submission
  submitCollection(): void {
    if (this.collectionForm.invalid || !this.userId) {
      this.message.error('Please fill all required fields.');
      return;
    }

    const { collectionName } = this.collectionForm.value;
    this.quranService.createCollection(this.userId, this.lang, collectionName).subscribe({
      next: (res: { message: any }) => {
        this.message.success(res.message || 'Collection created successfully');
        this.collectionForm.reset({ lang: 'en' }); // Reset form with default lang 'en'
        this.isModalVisible = false;
        this.fetchCollections(); // Refresh collections after creating a new one
      },
      error: (err: { error: { message: any } }) => {
        this.message.error(err.error?.message || 'Failed to create collection.');
      }
    });
  }

  // Handle modal cancel
  handleCancel(): void {
    this.isModalVisible = false;
  }

  // Show verses in a modal when a collection is clicked
  showVerses(collection: Collection): void {
    this.selectedCollection = collection;
    this.isVerseModalVisible = true;
  }

  // Handle verse modal cancel
  handleVerseModalCancel(): void {
    this.isVerseModalVisible = false;
    this.selectedCollection = null;
  }
}