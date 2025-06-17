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
  scrollAmount: number = 200; // Adjust scrolling speed

  // Sample Data (Replace with your dynamic data)
  cards = [
    { image: 'assets/images/Rectangle 13.svg', title: 'Scientific Miracles of the Qur’ān' },
    { image: 'assets/images/Rectangle 14.svg', title: 'Preservation and Literary Challenge of the Qur’ān' },
    { image: 'assets/images/Rectangle 15.svg', title: 'Miracles Performed' },
    { image: 'assets/images/Rectangle 16.svg', title: 'Short Guide to Ablution and Prayer' },
    { image: 'assets/images/Rectangle 17.svg', title: 'Women in Islām' },
    { image: 'assets/images/Rectangle 18.svg', title: 'The Unique Qur’ānic Generation' },
    { image: 'assets/images/Rectangle 19.svg', title: 'How do I become a Muslim?' },
    { image: 'assets/images/Rectangle 20.svg', title: 'Old and New Testament Prophecies of Muhammad' }
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
    // Encode title to handle spaces and special characters
    const encodedTitle = encodeURIComponent(title);
    this.router.navigate(['/quran/appendice', encodedTitle]);
  }
}
