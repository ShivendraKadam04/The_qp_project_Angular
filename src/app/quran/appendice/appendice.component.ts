import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuranService } from '../../services/quran.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appendice',
  standalone: false,
  templateUrl: './appendice.component.html',
  styleUrl: './appendice.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppendiceComponent implements OnInit {
  title: string | null = null;
  lang = 'english';
  rawContent = '';
  content: SafeHtml | null = null;
  error: string | null = null;
  loading = true;

  isAdmin = false;
  editing = false;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private quranService: QuranService,
    private authService: AuthService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();

    // Title/lang live in the query string so a page refresh or shared link still
    // works; router state is kept as a fallback for older in-app navigations.
    this.route.queryParamMap.subscribe(params => {
      this.title = params.get('title') || history.state?.title || null;
      this.lang = params.get('lang') || 'english';
      this.editing = false;
      if (this.title) {
        this.fetchAppendixContent();
      } else {
        this.error = 'No title provided.';
        this.loading = false;
      }
    });
  }

  startEdit() {
    this.editing = true;
  }

  cancelEdit() {
    this.editing = false;
  }

  saveContent(html: string) {
    if (!this.title) return;
    if (!html.trim()) {
      this.message.warning('Content cannot be empty.');
      return;
    }
    this.saving = true;
    this.quranService.updateAppendix(this.lang, this.title, html).subscribe({
      next: () => {
        this.saving = false;
        this.editing = false;
        this.message.success('Appendix saved.');
        this.fetchAppendixContent();
      },
      error: err => {
        this.saving = false;
        const status = err?.status;
        this.message.error(
          status === 401 || status === 403
            ? 'Your session has expired or you are not an admin. Please log in again.'
            : err?.error?.error || err?.error?.message || 'Could not save. Check your connection and try again.'
        );
      }
    });
  }

  /** Smooth-scrolls in-page (#id) links inside the appendix HTML. */
  onContentClick(event: MouseEvent) {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    event.preventDefault();
    const targetId = href.substring(1);
    const target = targetId && document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.router.navigate([], { fragment: targetId, queryParamsHandling: 'preserve', replaceUrl: true });
    }
  }

  private fetchAppendixContent() {
    this.loading = true;
    this.error = null;
    this.content = null;
    this.rawContent = '';

    this.quranService.getAppendix(this.lang, this.title!).subscribe({
      next: response => {
        this.rawContent = response.data.content;
        this.content = this.sanitizer.bypassSecurityTrustHtml(this.rawContent);
        this.loading = false;
      },
      error: err => {
        this.error = err?.status === 404
          ? 'This appendix is not available yet.'
          : 'Failed to load content. Please try again later.';
        this.loading = false;
      }
    });
  }
}
