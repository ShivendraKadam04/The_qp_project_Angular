import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-appendice',
  standalone: false,
  templateUrl: './appendice.component.html',
  styleUrl: './appendice.component.css'
})
export class AppendiceComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  title: string | null = null;
  content: SafeHtml | null = null;
  error: string | null = null;
  loading: boolean = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Get the title from history.state
    this.title = history.state.title || null;
    console.log('this.title', this.title);

    if (this.title) {
      this.fetchAppendixContent(this.title);
    } else {
      this.error = 'No title provided.';
      this.loading = false;
    }
  }

  private fetchAppendixContent(title: string) {
    this.loading = true;
    const url = `${this.apiUrl}/quran/english/appendices/${encodeURIComponent(title)}`;
    this.http
      .get<{ success: boolean; message: string; data: { title: string; content: string } }>(url)
      .pipe(
        map(response => {
          if (response.success) {
            console.log('response', response);
            return this.sanitizer.bypassSecurityTrustHtml(response.data.content);
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.error = 'Failed to load content. Please try again later.';
          console.error('API Error:', error);
          this.loading = false;
          return [];
        })
      )
      .subscribe(safeContent => {
        this.content = safeContent;
        this.loading = false;
      });
  }
}