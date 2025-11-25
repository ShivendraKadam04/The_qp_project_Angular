import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchSubject = new Subject<{ surahNo: number; verseNo?: number }>();
  search$ = this.searchSubject.asObservable();

  triggerSearch(surahNo: number, verseNo?: number) {
    this.searchSubject.next({ surahNo, verseNo });
  }
}