import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface EventDetails {
  id: number;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
}

type EventMap = Record<string, EventDetails[]>;


@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: EventMap = {};
  private eventsSubject = new BehaviorSubject<EventDetails[]>([]);
  events$ = this.eventsSubject.asObservable();

  selectedDateSubject = new BehaviorSubject<string>('');

  constructor() {
    this.loadDummyData();
    this.initializeEventsForToday();
  }

  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  private initializeEventsForToday() {
    const today = this.getTodayDateString();
    this.setSelectedDate(today);
  }

  updateEventsForDate(date: string, updatedEvents: EventDetails[]) {
    this.events[date] = updatedEvents;

    if (this.selectedDateSubject.getValue() === date) {
      this.eventsSubject.next([...updatedEvents]);
    }
  }

  setSelectedDate(date: string | undefined) {
    if (date != null) {
      this.selectedDateSubject.next(date);
      const eventsForDate = this.getEventsForDate(date);
      const emittedEvents = eventsForDate.length ? eventsForDate : [];
      this.eventsSubject.next(emittedEvents);

      if (emittedEvents.length === 0) {
        console.log(`No events for ${date}; emitted empty array`);
      }
    }
  }

  deleteEvent(date: string, eventId: number) {
    const eventsForDate = this.getEventsForDate(date);
    const updatedEvents = eventsForDate.filter(event => event.id !== eventId);

    this.updateEventsForDate(date, updatedEvents); // Emit the updated events
  }

  addEvent(date: string, event: EventDetails) {

    const newEventDate = date.split('T')[0];

    if (!this.events[newEventDate]) {
      this.events[newEventDate] = [];
    }

    this.events[newEventDate].push(event);

    if (this.selectedDateSubject.getValue() === newEventDate) {
      this.eventsSubject.next(this.events[newEventDate]);
    }
  }

  getEventsForDate(date: string): EventDetails[] {
    return this.events[date] || [];
  }

  private loadDummyData() {
    this.addEvent('2024-11-01', {
      id: 1,
      startTime: '02:00 AM',
      endTime: '03:00 AM',
      title: 'Meeting',
      description: 'Team sync-up'
    });
    this.addEvent('2024-11-02', {
      id: 2,
      startTime: '04:00 AM',
      endTime: '05:00 AM',
      title: 'Doctor Appointment',
      description: 'Annual check-up'
    });
    this.addEvent('2024-11-03', {
      id: 1,
      startTime: '08:00 AM',
      endTime: '09:00 AM',
      title: 'Workshop',
      description: 'Angular workshop'
    });
    this.addEvent('2024-11-04', {
      id: 1,
      startTime: '01:00 AM',
      endTime: '02:00 AM',
      title: 'Zoom Session',
      description: 'Meeting prospective employer'
    });
  }
}
