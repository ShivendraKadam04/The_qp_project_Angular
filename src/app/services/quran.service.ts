import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuranService {
  private apiUrl = environment.apiUrl;

  // The full Quran for a language is ~2 MB; fetch it once per language and share it
  // between the header search and the chapters page instead of re-downloading.
  private quranCache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) { }

  getQuranData(language: string): Observable<any> {
    let data$ = this.quranCache.get(language);
    if (!data$) {
      data$ = this.http.get(`${this.apiUrl}/quran/${language}`).pipe(shareReplay(1));
      this.quranCache.set(language, data$);
      // Drop failed requests from the cache so the next call retries.
      data$.subscribe({ error: () => this.quranCache.delete(language) });
    }
    return data$;
  }

  getAppendix(lang: string, title: string): Observable<{ success: boolean; message: string; data: { title: string; content: string } }> {
    return this.http.get<any>(`${this.apiUrl}/quran/${lang}/appendices/${encodeURIComponent(title)}`);
  }

  updateAppendix(lang: string, title: string, content: string): Observable<{ success: boolean; message: string }> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${sessionStorage.getItem('authToken')}` });
    return this.http.put<any>(`${this.apiUrl}/quran/${lang}/appendices/${encodeURIComponent(title)}`, { content }, { headers });
  }

    deleteCollection(userId: string, lang: string, collectionName: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/quran/delete-collection`, {
      body: { userId, lang, collectionName }
    });
  }

  deleteVerse(userId: string, lang: string, collectionName: string, surahNo: number, versesNo: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/quran/delete-verse`, {
      body: { userId, lang, collectionName, surahNo, versesNo }
    });
  }

    createCollection(userId: string, lang: string, collectionName: string): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    const body = { userId, lang, collectionName };
    return this.http.post(`${this.apiUrl}/quran/create-collection`, body, { headers });
  }

  getFavoriteVerses(userId: string, lang: string): Observable<any> {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/quran/favorite-verses/${userId}/${lang}`, { headers });
  }

  saveVerseToCollection(userId: string, lang: string, surahNo: number, versesNo: number, collectionName: string): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  const body = { userId, lang, surahNo, versesNo, collectionName };
  return this.http.post(`${this.apiUrl}/quran/favorite-verse`, body, { headers });
}
}
