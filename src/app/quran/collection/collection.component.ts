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
  isVerseModalVisible = false;
  selectedCollection: Collection | null = null;
  collections: Collection[] = [];
  userId: string | null = null;
  lang = 'english';
  isLoading = false; // Add loading state

  constructor(
    private fb: FormBuilder,
    private quranService: QuranService,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.collectionForm = this.fb.group({
      collectionName: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.message.error('User not logged in. Please log in to create a collection.');
      return;
    }

    this.fetchCollections();
  }

  collectionsLength: any;

  fetchCollections(): void {
    if (this.userId) {
      this.isLoading = true; // Set loading to true
      this.quranService.getFavoriteVerses(this.userId, this.lang).subscribe({
        next: (res: { message: string; data: Collection[] }) => {
          this.collections = res.data;
          this.collectionsLength = this.collections.length;
          this.isLoading = false; // Set loading to false
          console.log("this.collections", this.collections);
        },
        error: (err: { error: { message: any } }) => {
          this.message.error(err.error?.message || 'Failed to fetch collections.');
          this.isLoading = false; // Set loading to false
        }
      });
    }
  }

  showModal(): void {
    this.isModalVisible = true;
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
        this.fetchCollections();
      },
      error: (err: { error: { message: any } }) => {
        this.message.error(err.error?.message || 'Failed to create collection.');
      }
    });
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  showVerses(collection: Collection): void {
    this.selectedCollection = collection;
    this.isVerseModalVisible = true;
  }

  handleVerseModalCancel(): void {
    this.isVerseModalVisible = false;
    this.selectedCollection = null;
  }
}