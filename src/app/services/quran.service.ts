import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuranService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  

    getQuranData(language: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/quran/${language}`);

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
