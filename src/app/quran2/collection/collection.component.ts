import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuranService } from '../../services/quran.service';
import { AuthService } from '../../services/auth.service';
import { NzModalService } from 'ng-zorro-antd/modal';

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
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private quranService: QuranService,
    private authService: AuthService,
    private message: NzMessageService,
    private modal: NzModalService
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

  collectionsLength: number = 0;

  fetchCollections(): void {
    if (this.userId) {
      this.isLoading = true;
      this.quranService.getFavoriteVerses(this.userId, this.lang).subscribe({
        next: (res: { message: string; data: Collection[] }) => {
          this.collections = res.data;
          this.collectionsLength = this.collections.length;
          this.isLoading = false;
          console.log("this.collections", this.collections);
          // Update selectedCollection if it still exists in the updated collections
          if (this.selectedCollection) {
            const updatedCollection = this.collections.find(col => col.collectionName === this.selectedCollection!.collectionName);
            this.selectedCollection = updatedCollection || null;
          }
        },
        error: (err: { error: { message: any } }) => {
          this.message.error(err.error?.message || 'Failed to fetch collections.');
          this.isLoading = false;
        }
      });
    }
  }

  showModal(): void {
    this.isModalVisible = true;
  }

  deleteCollection(collectionName: string): void {
    if (!this.userId) {
      this.message.error('User not logged in.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Confirm Delete Collection',
      nzContent: `Are you sure you want to delete the collection '${collectionName}'?`,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.quranService.deleteCollection(this.userId!, this.lang, collectionName).subscribe({
          next: (res: { message: any }) => {
            this.message.success(res.message || 'Collection deleted successfully');
            this.fetchCollections();
            if (this.selectedCollection?.collectionName === collectionName) {
              this.handleVerseModalCancel();
            }
          },
          error: (err: { error: { message: any } }) => {
            this.message.error(err.error?.message || 'Failed to delete collection.');
          }
        });
      }
    });
  }

  deleteVerse(verse: Verse, collectionName: string): void {
    if (!this.userId) {
      this.message.error('User not logged in.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Confirm Delete Verse',
      nzContent: `Are you sure you want to delete verse ${verse.versesNo} from Surah ${verse.surahName}?`,
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.quranService.deleteVerse(this.userId!, this.lang, collectionName, verse.surahNo, verse.versesNo).subscribe({
          next: (res: { message: any }) => {
            this.message.success(res.message || 'Verse deleted successfully');
            this.fetchCollections();
            // Update selectedCollection after verse deletion
            if (this.selectedCollection && this.selectedCollection.collectionName === collectionName) {
              const updatedCollection = this.collections.find(col => col.collectionName === collectionName);
              this.selectedCollection = updatedCollection || null;
            }
          },
          error: (err: { error: { message: any } }) => {
            this.message.error(err.error?.message || 'Failed to delete verse.');
          }
        });
      }
    });
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