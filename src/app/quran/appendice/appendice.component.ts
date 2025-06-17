import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, catchError, map } from 'rxjs';
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
  loading: boolean = true; // Add loading state

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Get the title from the route parameters
    this.route.paramMap.subscribe(params => {
      this.title = params.get('title');
      if (this.title) {
        // Decode the title in case it was encoded
        this.title = decodeURIComponent(this.title);
        this.fetchAppendixContent(this.title);
      }
    });
  }

  private fetchAppendixContent(title: string) {
    this.loading = true; // Set loading to true when starting the fetch
    const url = `${this.apiUrl}/quran/english/appendices/${encodeURIComponent(title)}`;
    this.http.get<{ success: boolean, message: string, data: { title: string, content: string } }>(url)
      .pipe(
        map(response => {
          if (response.success) {
            console.log("response", response);
            // Sanitize the HTML content to prevent XSS attacks
            return this.sanitizer.bypassSecurityTrustHtml(response.data.content);
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.error = 'Failed to load content. Please try again later.';
          console.error('API Error:', error);
          this.loading = false; // Stop loading on error
          return [];
        })
      )
      .subscribe(safeContent => {
        this.content = safeContent;
        this.loading = false; // Stop loading when data is fetched
      });
  }
}