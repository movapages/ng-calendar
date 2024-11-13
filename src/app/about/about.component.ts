import {Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {Router, RouterOutlet} from '@angular/router';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatDivider,
    MatButton,
    NgIf,
    RouterOutlet
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  constructor(private router: Router) {
  }

  goToDetails() {
    this.router.navigate(['about/details']);
  }
}
