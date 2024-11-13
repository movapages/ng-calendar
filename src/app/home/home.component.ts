import {Component} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {CalendarComponent} from './blocks/calendar/calendar.component';
import {EventsComponent} from './blocks/events/events.component';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatDivider,
    CalendarComponent,
    EventsComponent,
    MatGridList,
    MatGridTile,
    MatToolbar,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
