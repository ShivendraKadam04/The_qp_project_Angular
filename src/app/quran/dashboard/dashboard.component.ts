import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  @ViewChild('scrollWrapper', { static: false }) scrollWrapper!: ElementRef;

  isAtStart: boolean = true;
  isAtEnd: boolean = false;

  cards = [
    { image: 'assets/images/web/introtoquran.webp', title: 'Introduction to the Study of the Qur’ān' },
    { image: 'assets/images/web/card-13.webp', title: 'Scientific Miracles of the Qur’ān' },
    { image: 'assets/images/web/card-14.webp', title: 'Preservation and Literary Challenge of the Qur’ān' },
    { image: 'assets/images/web/card-15.webp', title: 'Miracles Performed' },
    { image: 'assets/images/web/card-16.webp', title: 'Short Guide to Ablution and Prayer' },
    { image: 'assets/images/web/card-17.webp', title: 'Women in Islām' },
    { image: 'assets/images/web/card-18.webp', title: 'The Unique Qur’ānic Generation' },
    { image: 'assets/images/web/card-19.webp', title: 'How do I become a Muslim?' },
    { image: 'assets/images/web/card-20.webp', title: 'Old and New Testament Prophecies of Muhammad' }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // After first render so the arrow state doesn't change mid change-detection.
    setTimeout(() => this.checkScroll());
  }

  scrollLeft() {
    this.scrollByPage(-1);
  }

  scrollRight() {
    this.scrollByPage(1);
  }

  private scrollByPage(direction: number) {
    const element = this.scrollWrapper.nativeElement as HTMLElement;
    element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: 'smooth' });
  }

  @HostListener('window:resize')
  checkScroll() {
    const element = this.scrollWrapper?.nativeElement as HTMLElement | undefined;
    if (!element) return;
    // 2px tolerance: scroll positions are fractional on zoomed / high-DPI screens.
    this.isAtStart = element.scrollLeft <= 2;
    this.isAtEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
  }

  navigateToAppendice(title: string) {
    this.router.navigate(['/quran/appendice'], {
      queryParams: { title } // In the URL so refresh / shared links keep working
    });
  }
}