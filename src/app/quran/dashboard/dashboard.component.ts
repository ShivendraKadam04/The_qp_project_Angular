import { Component, ElementRef, ViewChild } from '@angular/core';

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
    { image: 'assets/images/Rectangle 13.svg', title: 'Scientific Miracles' },
    { image: 'assets/images/Rectangle 14.svg', title: 'Preservation & Literary Challenges' },
    { image: 'assets/images/Rectangle 15.svg', title: 'Miracles Performed' },
    { image: 'assets/images/Rectangle 16.svg', title: 'Short Guide To Ablution & Prayer' },
    { image: 'assets/images/Rectangle 17.svg', title: 'Women In Islam' },
    { image: 'assets/images/Rectangle 18.svg', title: 'The Unique Quranic Generation' },
    { image: 'assets/images/Rectangle 19.svg', title: 'Short Biography: The Prophet Muhammad' },
    { image: 'assets/images/Rectangle 20.svg', title: 'Old & New Testament Prophecies' }
  ];

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
}
