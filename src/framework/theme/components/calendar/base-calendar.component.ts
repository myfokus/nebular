/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  input,
  OnInit,
  Output,
  signal,
  Type,
} from '@angular/core';

import { NbCalendarYearModelService } from '../calendar-kit/services/calendar-year-model.service';
import {
  NbCalendarCell,
  NbCalendarSize,
  NbCalendarViewMode,
  NbCalendarSizeValues,
  NbCalendarViewModeValues,
} from '../calendar-kit/model';
import { NbDateService } from '../calendar-kit/services/date.service';
import { convertToBoolProperty } from '../helpers';

/**
 * The basis for calendar and range calendar components.
 * Encapsulates common behavior - store calendar state and perform navigation
 * between pickers.
 * */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-base-calendar',
  templateUrl: './base-calendar.component.html',
  standalone: false,
})
export class NbBaseCalendarComponent<D, T> implements OnInit {
  /**
   * Defines if we should render previous and next months
   * in the current month view.
   * */
  readonly boundingMonth = input<boolean>(true);

  /**
   * Defines active view for calendar.
   * */
  @Input('startView')
  get activeViewMode(): NbCalendarViewMode {
    return this._activeViewMode();
  }
  set activeViewMode(value: NbCalendarViewMode) {
    this._activeViewMode.set(value);
  }
  private readonly _activeViewMode = signal<NbCalendarViewMode>(NbCalendarViewMode.DATE);
  static ngAcceptInputType_activeViewMode: NbCalendarViewModeValues;

  /**
   * Minimum available date for selection.
   * */
  readonly min = input<D>();

  /**
   * Maximum available date for selection.
   * */
  readonly max = input<D>();

  /**
   * Predicate that decides which cells will be disabled.
   * */
  readonly filter = input<(D) => boolean>();

  /**
   * Custom day cell component. Have to implement `NbCalendarCell` interface.
   * */
  readonly dayCellComponent = input<Type<NbCalendarCell<D, T>>>();

  /**
   * Custom month cell component. Have to implement `NbCalendarCell` interface.
   * */
  readonly monthCellComponent = input<Type<NbCalendarCell<D, T>>>();

  /**
   * Custom year cell component. Have to implement `NbCalendarCell` interface.
   * */
  readonly yearCellComponent = input<Type<NbCalendarCell<D, T>>>();

  /**
   * Size of the calendar and entire components.
   * Can be 'medium' which is default or 'large'.
   * */
  readonly size = input<NbCalendarSize, NbCalendarSize | NbCalendarSizeValues>(NbCalendarSize.MEDIUM, {
    transform: (value) => value as NbCalendarSize,
  });

  @Input()
  get visibleDate(): D {
    return this._visibleDate();
  }
  set visibleDate(value: D) {
    this._visibleDate.set(value);
  }
  private readonly _visibleDate = signal<D>(undefined);

  /**
   * Determines whether we should show calendar navigation or not.
   * */
  readonly showNavigation = input<boolean>(true);

  @HostBinding('class.has-navigation')
  get hasNavigation(): boolean {
    return this.showNavigation();
  }

  /**
   * Value which will be rendered as selected.
   * */
  readonly date = input<T>();

  /**
   * Determines should we show week numbers column.
   * False by default.
   * */
  readonly showWeekNumber = input(false, { transform: convertToBoolProperty });

  @HostBinding('class.has-week-number')
  get hasWeekNumber(): boolean {
    return this.showWeekNumber();
  }

  /**
   * Sets symbol used as a header for week numbers column
   * */
  readonly weekNumberSymbol = input<string>();

  /**
   * Sets first day of the week, it can be 1 if week starts from monday and 0 if from sunday and so on.
   * `undefined` means that default locale setting will be used.
   * */
  readonly firstDayOfWeek = input<number | undefined>();

  /**
   * Emits date when selected.
   * */
  @Output() dateChange: EventEmitter<T> = new EventEmitter();

  constructor(protected dateService: NbDateService<D>, protected yearModelService: NbCalendarYearModelService<D>) {}

  ngOnInit() {
    if (!this.visibleDate) {
      this.visibleDate = this.dateService.today();
    }
  }

  @HostBinding('class.size-large')
  get large() {
    return this.size() === NbCalendarSize.LARGE;
  }

  ViewMode = NbCalendarViewMode;

  setViewMode(viewMode: NbCalendarViewMode) {
    this.activeViewMode = viewMode;
  }

  setVisibleDate(visibleDate: D) {
    this.visibleDate = visibleDate;
  }

  prevMonth() {
    this.changeVisibleMonth(-1);
  }

  nextMonth() {
    this.changeVisibleMonth(1);
  }

  prevYear() {
    this.changeVisibleYear(-1);
  }

  nextYear() {
    this.changeVisibleYear(1);
  }

  prevYears() {
    this.changeVisibleYears(-1);
  }

  nextYears() {
    this.changeVisibleYears(1);
  }

  navigatePrev() {
    switch (this.activeViewMode) {
      case NbCalendarViewMode.DATE:
        return this.prevMonth();
      case NbCalendarViewMode.MONTH:
        return this.prevYear();
      case NbCalendarViewMode.YEAR:
        return this.prevYears();
    }
  }

  navigateNext() {
    switch (this.activeViewMode) {
      case NbCalendarViewMode.DATE:
        return this.nextMonth();
      case NbCalendarViewMode.MONTH:
        return this.nextYear();
      case NbCalendarViewMode.YEAR:
        return this.nextYears();
    }
  }

  onChangeViewMode() {
    if (this.activeViewMode === NbCalendarViewMode.DATE) {
      return this.setViewMode(NbCalendarViewMode.YEAR);
    }

    this.setViewMode(NbCalendarViewMode.DATE);
  }

  private changeVisibleMonth(direction: number) {
    this.visibleDate = this.dateService.addMonth(this.visibleDate, direction);
  }

  private changeVisibleYear(direction: number) {
    this.visibleDate = this.dateService.addYear(this.visibleDate, direction);
  }

  private changeVisibleYears(direction: number) {
    this.visibleDate = this.dateService.addYear(this.visibleDate, direction * this.yearModelService.getYearsInView());
  }
}
