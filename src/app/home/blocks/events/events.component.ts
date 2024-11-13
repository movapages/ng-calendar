import {Component, OnInit, OnDestroy, QueryList, ViewChildren} from '@angular/core';
import {DragDropModule, CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {Subscription} from 'rxjs';
import {EventService, EventDetails} from '../../../../services/event.service';
import {NgForOf, NgIf, NgStyle} from '@angular/common';

interface TimeSlot {
  id: number;
  hour: string;
  event: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  standalone: true,
  imports: [
    DragDropModule,
    CdkDropList,
    CdkDrag,
    NgForOf,
    NgIf,
    NgStyle
  ],
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit, OnDestroy {

  @ViewChildren('listId') dropLists!: QueryList<CdkDropList>;

  dataSource: TimeSlot[] = Array.from({length: 24}, (_, i) => {
    const period = i >= 12 ? 'PM' : 'AM';
    const hour = i % 12 === 0 ? 12 : i % 12;
    return {hour: `${hour} ${period}`, event: ' - ', startTime: '', endTime: '', id: i};
  });

  private eventSubscription: Subscription | undefined;
  connectedDropLists: (CdkDropList | string)[] = [];

  constructor(private eventService: EventService) {
  }

  ngOnInit() {
    // Subscribe to event data updates
    this.eventSubscription = this.eventService.events$.subscribe(events => {
      if (events.length) {
        this.updateDataSource(events);
      } else {
        this.updateDataSource([]);
      }
    });
  }

  ngOnDestroy() {
    this.eventSubscription?.unsubscribe();
  }

  deleteEvent(eventId: number) {
    const selectedDate = this.eventService.selectedDateSubject.getValue();
    this.eventService.deleteEvent(selectedDate, eventId);
  }

  drop(event: CdkDragDrop<TimeSlot[]>) {
    const previousIndex = event.previousIndex;
    const currentElementId = event.container.element.nativeElement.getAttribute('data-hour-label');
    const currentIndex = this.dataSource.findIndex(slot => slot.hour === currentElementId);

    if (previousIndex !== currentIndex && currentIndex !== -1) {
      const movedEvent = {...event.previousContainer.data[0]};
      event.previousContainer.data[0].event = ' - ';
      event.previousContainer.data[0].startTime = '';
      event.previousContainer.data[0].endTime = '';
      const newStartTime = this.formatTimeToStandard(this.dataSource[currentIndex].hour);
      const newStartTimeInHours = this.convertTimeToHours(newStartTime);
      const newEndTime = this.convertHoursToTime(newStartTimeInHours + 1);

      event.container.data[0].event = movedEvent.event;
      event.container.data[0].startTime = newStartTime;
      event.container.data[0].endTime = newEndTime;

      this.updateEventInService(movedEvent.id, newStartTime, newEndTime);

      // console.log(`Event moved from index ${previousIndex} to ${currentIndex}`);
      this.dataSource = [...this.dataSource];
    } else {
      // console.log('No movement detected; indices are the same.');
    }
  }

  private updateEventInService(eventId: number, newStartTime: string, newEndTime: string) {
    const selectedDate = this.eventService.selectedDateSubject.getValue();
    const eventsForDate = this.eventService.getEventsForDate(selectedDate);

    const eventToUpdate = eventsForDate.find(event => event.id === eventId);
    if (eventToUpdate) {
      eventToUpdate.startTime = newStartTime;
      eventToUpdate.endTime = newEndTime;
      this.eventService.updateEventsForDate(selectedDate, eventsForDate);
    } else {
      console.warn(`Event with ID ${eventId} not found for date ${selectedDate}`);
    }
  }

  private formatTimeToStandard(time: string): string {
    const [hour, period] = time.split(' ');
    return `${hour}:00 ${period}`;
  }

  private updateDataSource(events: EventDetails[]) {
    this.dataSource.forEach(slot => {
      slot.event = ' - ';
      slot.startTime = '';
      slot.endTime = '';
    });

    if (events.length === 0) {
      this.dataSource = Array.from({length: 24}, (_, i) => {
        const period = i >= 12 ? 'PM' : 'AM';
        const hour = i % 12 === 0 ? 12 : i % 12;
        return {hour: `${hour} ${period}`, event: ' - ', startTime: '', endTime: '', id: i};
      });
      this.dataSource = [...this.dataSource];
      return;
    }

    events.forEach(event => {
      const startHour = this.convertTimeToHours(event.startTime);
      const startIndex = Math.floor(startHour);

      if (startIndex < this.dataSource.length) {
        this.dataSource[startIndex] = {
          ...this.dataSource[startIndex],
          event: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          id: event.id
        };
      } else {
        console.warn(`Event with start time ${event.startTime} is out of range.`);
      }
    });
    this.dataSource = [...this.dataSource];
  }

  private convertHoursToTime(hours: number): string {
    if (isNaN(hours)) {
      console.error(`Invalid hour value: ${hours}`);
      return 'Invalid Time';
    }

    const hr = Math.floor(hours);
    const min = Math.round((hours - hr) * 60);
    const period = hr >= 12 ? 'PM' : 'AM';
    const hour12 = hr % 12 === 0 ? 12 : hr % 12;
    return `${hour12}:${min.toString().padStart(2, '0')} ${period}`;
  }

  private convertTimeToHours(time: string): number {
    const [hourMin, period] = time.split(' ');
    let hour: number;
    let minutes: number;

    if (hourMin.includes(':')) {
      [hour, minutes] = hourMin.split(':').map(Number);
    } else {
      hour = Number(hourMin);
      minutes = 0;
    }

    if (isNaN(hour) || isNaN(minutes)) {
      console.error(`Invalid time format: ${time}`);
      return NaN;
    }

    const hoursIn24 = period === 'PM' && hour !== 12 ? hour + 12 : hour === 12 && period === 'AM' ? 0 : hour;
    return hoursIn24 + minutes / 60;
  }

  trackByFn(_index: number, item: TimeSlot): number {
    return item.id;
  }

}
