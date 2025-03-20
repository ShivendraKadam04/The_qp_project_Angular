import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  cards = [
    { title: 'Scientific Miracles Of The Quran', image: 'assets/scientific-miracles.jpg' },
    { title: 'Preservation & Literary Challenges Of The Quran', image: 'assets/preservation.jpg' },
    { title: 'Miracles Performed', image: 'assets/miracles.jpg' },
    { title: 'Short Guide To Ablution & Prayer', image: 'assets/ablution.jpg' },
    { title: 'Women In Islam', image: 'assets/women-islam.jpg' },
    { title: 'The Unique Quranic Generation', image: 'assets/quranic-generation.jpg' }
  ];
}
