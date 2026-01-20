import { Component, OnInit, AfterViewChecked, ElementRef } from '@angular/core';
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
export class AppendiceComponent implements OnInit, AfterViewChecked {
  private apiUrl = environment.apiUrl;
  title: string | null = null;
  content: SafeHtml | null = null;
  error: string | null = null;
  loading: boolean = true;

  private hasSetupClickListener = false;  // ← Important: prevent multiple listeners

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.title = history.state.title || null;
    if (this.title) {
      this.fetchAppendixContent(this.title);
    } else {
      this.error = 'No title provided.';
      this.loading = false;
    }
  }

  ngAfterViewChecked() {
    // Setup click interception only once after content is rendered
    if (this.content && !this.hasSetupClickListener) {
      this.setupAnchorClickInterceptor();
      this.hasSetupClickListener = true;
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
        this.hasSetupClickListener = false; // Allow re-setup on next content load
      });
  }

  // This is the magic function
  private setupAnchorClickInterceptor() {
    const anchors = this.el.nativeElement.querySelectorAll('a[href^="#"]');
    
    anchors.forEach((anchor: HTMLElement) => {
      anchor.addEventListener('click', (event) => {
        event.preventDefault(); // Stop normal navigation
        event.stopPropagation();

        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const targetId = href.substring(1); // Remove #
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Smooth scroll to the section
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Optional: Update URL without reloading (nice for back button)
          this.router.navigate([], {
            fragment: targetId,
            replaceUrl: true,
            skipLocationChange: false
          });
        }
      });
    });
  }
}