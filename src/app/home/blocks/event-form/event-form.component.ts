import {Component, OnInit} from '@angular/core';
import {DATE_PIPE_DEFAULT_OPTIONS, DatePipe} from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import {MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatLabel} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatBadge} from '@angular/material/badge';
import {MatIcon} from '@angular/material/icon';
import {
  NgxMatTimepickerComponent,
  NgxMatTimepickerDirective,
  NgxMatTimepickerToggleComponent
} from 'ngx-mat-timepicker';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  standalone: true,
  imports: [
    DatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatLabel,
    ReactiveFormsModule,
    MatDivider,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatBadge,
    MatIcon,
    NgxMatTimepickerDirective,
    NgxMatTimepickerToggleComponent,
    NgxMatTimepickerComponent,
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline', floatLabel: 'always'}},
    {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {dateFormat: 'shortDate'},}
  ]
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  selectedDate: Date;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EventFormComponent>
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      eventName: ['', Validators.required],
      date: [null, Validators.required],
      startTime: ['', [Validators.required, this.futureTimeValidator()]],
      endTime: ['', [Validators.required, this.endTimeValidator()]],
    });

    this.selectedDate = new Date();
  }

  ngOnInit(): void {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1);

    const oneHourLater = new Date(nextHour);
    oneHourLater.setHours(nextHour.getHours() + 1);

    const startTime = nextHour.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
    const endTime = oneHourLater.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});

    this.eventForm.patchValue({
      date: new Date(),
      startTime: startTime,
      endTime: endTime
    });
  }

  futureTimeValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl) => {
      if (!control.value || typeof control.value !== 'string') return {invalidTime: true};

      const [selectedHours, selectedMinutes] = control.value.split(':').map(Number);
      if (isNaN(selectedHours) || isNaN(selectedMinutes)) {
        console.error('Invalid time format in startTime:', control.value);
        return {invalidTime: true};
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const isValid =
        selectedHours > currentHour ||
        (selectedHours === currentHour + 1 && selectedMinutes >= currentMinute);

      return isValid ? null : {invalidTime: true};
    };
  }

  endTimeValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl) => {
      const startTimeControl = this.eventForm?.get('startTime');
      if (!startTimeControl || !startTimeControl.value || !control.value) return {invalidTime: true};

      const [startHours, startMinutes] = startTimeControl.value.split(':').map(Number);
      const [endHours, endMinutes] = control.value.split(':').map(Number);

      if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        return {invalidTime: true};
      }

      const startTime = new Date(1970, 0, 1, startHours, startMinutes);
      const endTime = new Date(1970, 0, 1, endHours, endMinutes);

      return endTime > startTime ? null : {invalidTime: true};
    };
  }


  onSave() {
    Object.keys(this.eventForm.controls).forEach(controlName => {
      const control = this.eventForm.get(controlName);
      console.info(`Control: ${controlName}, Valid: ${control?.valid}, Errors:`, control?.errors);
    });

    if (this.eventForm.valid) {
      this.dialogRef.close(this.eventForm.value);
    } else {
      console.error('Form is invalid, please check errors.');
    }
  }


  onCancel() {
    this.dialogRef.close();
  }
}
