import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DATE_PIPE_DEFAULT_OPTIONS, DatePipe} from '@angular/common';
import {MatCalendar, MatCalendarHeader} from '@angular/material/datepicker';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButton, MatFabButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {EventFormComponent} from '../event-form/event-form.component';
import {EventService} from '../../../../services/event.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    DatePipe,
    MatCalendarHeader,
    MatCalendar,
    MatDatepickerModule,
    MatFabButton,
    MatIcon,
    MatButton,
    MatIconButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: {dateFormat: 'longDate'},
    }
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  today = new Date();
  selectedDate = '';

  constructor(private dialog: MatDialog, private eventService: EventService) {
  }

  onDateSelected(date: Date | null) {
    if (date) {
      const formattedDate = this.fromDateToString(date);
      this.selectedDate = formattedDate;
      this.eventService.setSelectedDate(formattedDate);
    }
  }

  fromDateToString(date: Date | null) {
    let dateAsString = '';
    if (date) {
      date.setTime(date.getTime() - (date.getTimezoneOffset() * 60000));
      dateAsString = date.toISOString().slice(0, 19).split('T')[0];
    }
    return dateAsString;
  }

  openAddEventDialog(): void {

    if (!this.selectedDate) {
      this.selectedDate = this.today.toISOString();
      console.warn('No date selected for event, we use today: ', this.selectedDate);
    }

    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newEvent = {
          id: (this.eventService.getEventsForDate(this.selectedDate).length || 1),
          startTime: result.startTime,
          endTime: result.endTime,
          title: result.title,
          description: result.eventName,
        };
        this.eventService.addEvent(this.selectedDate, newEvent);
      }
    });
  }
}
