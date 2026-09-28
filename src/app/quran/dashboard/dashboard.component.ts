import { Component, ElementRef, ViewChild } from '@angular/core';
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
  scrollAmount: number = 200;

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
    this.checkScroll();
  }

  scrollLeft() {
    this.scrollWrapper.nativeElement.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 400);
  }

  scrollRight() {
    this.scrollWrapper.nativeElement.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 400);
  }

  checkScroll() {
    const element = this.scrollWrapper.nativeElement;
    this.isAtStart = element.scrollLeft === 0;
    this.isAtEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth;
  }

  navigateToAppendice(title: string) {
    this.router.navigate(['/quran/appendice'], {
      queryParams: { title } // In the URL so refresh / shared links keep working
    });
  }
}