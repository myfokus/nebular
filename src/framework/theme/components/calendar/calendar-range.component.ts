/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, input, Output, signal, Type } from '@angular/core';

import {
  NbCalendarCell,
  NbCalendarSize,
  NbCalendarViewMode,
  NbCalendarSizeValues,
  NbCalendarViewModeValues,
} from '../calendar-kit/model';
import { NbDateService } from '../calendar-kit/services/date.service';
import { NbCalendarRangeDayCellComponent } from './calendar-range-day-cell.component';
import { NbCalendarRangeYearCellComponent } from './calendar-range-year-cell.component';
import { NbCalendarRangeMonthCellComponent } from './calendar-range-month-cell.component';
import { convertToBoolProperty } from '../helpers';

export interface NbCalendarRange<D> {
  start: D;
  end?: D;
}

/**
 * CalendarRange component provides a capability to choose a date range.
 *
 * ```html
 * <nb-calendar [(date)]="date"></nb-calendar>
 * <nb-calendar [date]="date" (dateChange)="handleDateChange($event)"></nb-calendar>
 * ```
 *
 * Basic usage example
 * @stacked-example(Range, calendar/calendar-range-showcase.component)
 *
 * ### Installation
 *
 * Import `NbCalendarRangeModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbCalendarRangeModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 *
 * ### Usage
 *
 * CalendarRange component supports all of the Calendar component customization properties. More defails can be found
 * in the [Calendar component docs](docs/components/calendar).
 *
 * @styles
 *
 * calendar-width:
 * calendar-background-color:
 * calendar-border-color:
 * calendar-border-style:
 * calendar-border-width:
 * calendar-border-radius:
 * calendar-text-color:
 * calendar-text-font-family:
 * calendar-text-font-size:
 * calendar-text-font-weight:
 * calendar-text-line-height:
 * calendar-picker-padding-top:
 * calendar-picker-padding-bottom:
 * calendar-picker-padding-start:
 * calendar-picker-padding-end:
 * calendar-navigation-text-color:
 * calendar-navigation-text-font-family:
 * calendar-navigation-title-text-font-size:
 * calendar-navigation-title-text-font-weight:
 * calendar-navigation-title-text-line-height:
 * calendar-navigation-padding:
 * calendar-cell-inactive-text-color:
 * calendar-cell-disabled-text-color:
 * calendar-cell-hover-background-color:
 * calendar-cell-hover-border-color:
 * calendar-cell-hover-text-color:
 * calendar-cell-hover-text-font-size:
 * calendar-cell-hover-text-font-weight:
 * calendar-cell-hover-text-line-height:
 * calendar-cell-active-background-color:
 * calendar-cell-active-border-color:
 * calendar-cell-active-text-color:
 * calendar-cell-active-text-font-size:
 * calendar-cell-active-text-font-weight:
 * calendar-cell-active-text-line-height:
 * calendar-cell-today-background-color:
 * calendar-cell-today-border-color:
 * calendar-cell-today-text-color:
 * calendar-cell-today-text-font-size:
 * calendar-cell-today-text-font-weight:
 * calendar-cell-today-text-line-height:
 * calendar-cell-today-hover-background-color:
 * calendar-cell-today-hover-border-color:
 * calendar-cell-today-active-background-color:
 * calendar-cell-today-active-border-color:
 * calendar-cell-today-disabled-border-color:
 * calendar-cell-today-selected-background-color:
 * calendar-cell-today-selected-border-color:
 * calendar-cell-today-selected-text-color:
 * calendar-cell-today-selected-hover-background-color:
 * calendar-cell-today-selected-hover-border-color:
 * calendar-cell-today-selected-active-background-color:
 * calendar-cell-today-selected-active-border-color:
 * calendar-cell-today-in-range-background-color:
 * calendar-cell-today-in-range-border-color:
 * calendar-cell-today-in-range-text-color:
 * calendar-cell-today-in-range-hover-background-color:
 * calendar-cell-today-in-range-hover-border-color:
 * calendar-cell-today-in-range-active-background-color:
 * calendar-cell-today-in-range-active-border-color:
 * calendar-cell-selected-background-color:
 * calendar-cell-selected-border-color:
 * calendar-cell-selected-text-color:
 * calendar-cell-selected-text-font-size:
 * calendar-cell-selected-text-font-weight:
 * calendar-cell-selected-text-line-height:
 * calendar-cell-selected-hover-background-color:
 * calendar-cell-selected-hover-border-color:
 * calendar-cell-selected-active-background-color:
 * calendar-cell-selected-active-border-color:
 * calendar-day-cell-width:
 * calendar-day-cell-height:
 * calendar-month-cell-width:
 * calendar-month-cell-height:
 * calendar-year-cell-width:
 * calendar-year-cell-height:
 * calendar-weekday-background:
 * calendar-weekday-divider-color:
 * calendar-weekday-divider-width:
 * calendar-weekday-text-color:
 * calendar-weekday-text-font-size:
 * calendar-weekday-text-font-weight:
 * calendar-weekday-text-line-height:
 * calendar-weekday-holiday-text-color:
 * calendar-weekday-height:
 * calendar-weekday-width:
 * calendar-weeknumber-background:
 * calendar-weeknumber-divider-color:
 * calendar-weeknumber-divider-width:
 * calendar-weeknumber-text-color:
 * calendar-weeknumber-text-font-size:
 * calendar-weeknumber-text-font-weight:
 * calendar-weeknumber-text-line-height:
 * calendar-weeknumber-height:
 * calendar-weeknumber-width:
 * calendar-large-width:
 * calendar-day-cell-large-width:
 * calendar-day-cell-large-height:
 * calendar-weekday-large-height:
 * calendar-weekday-large-width:
 * calendar-weeknumber-large-height:
 * calendar-weeknumber-large-width:
 * calendar-month-cell-large-width:
 * calendar-month-cell-large-height:
 * calendar-year-cell-large-width:
 * calendar-year-cell-large-height:
 * */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-calendar-range',
  template: `
    <nb-base-calendar
      [date]="range"
      (dateChange)="onChange($any($event))"
      [min]="min()"
      [max]="max()"
      [filter]="filter()"
      [startView]="startView()"
      [boundingMonth]="boundingMonth()"
      [dayCellComponent]="dayCellComponent()"
      [monthCellComponent]="monthCellComponent()"
      [yearCellComponent]="yearCellComponent()"
      [visibleDate]="visibleDate()"
      [showNavigation]="showNavigation()"
      [size]="size()"
      [showWeekNumber]="showWeekNumber()"
      [weekNumberSymbol]="weekNumberSymbol()"
      [firstDayOfWeek]="firstDayOfWeek()"
    ></nb-base-calendar>
  `,
  standalone: false,
})
export class NbCalendarRangeComponent<D> {
  /**
   * Defines if we should render previous and next months
   * in the current month view.
   * */
  readonly boundingMonth = input<boolean>(true);

  /**
   * Defines starting view for the calendar.
   * */
  readonly startView = input<NbCalendarViewMode, NbCalendarViewMode | NbCalendarViewModeValues>(
    NbCalendarViewMode.DATE,
    { transform: (value) => value as NbCalendarViewMode },
  );

  /**
   * A minimum available date for selection.
   * */
  readonly min = input<D>();

  /**
   * A maximum available date for selection.
   * */
  readonly max = input<D>();

  /**
   * A predicate that decides which cells will be disabled.
   * */
  readonly filter = input<(D) => boolean>();

  /**
   * Custom day cell component. Have to implement `NbCalendarCell` interface.
   * Falsy values keep the default range day cell.
   * */
  readonly dayCellComponent = input<
    Type<NbCalendarCell<D, NbCalendarRange<D>>>,
    Type<NbCalendarCell<D, NbCalendarRange<D>>> | null | undefined
  >(NbCalendarRangeDayCellComponent, {
    transform: (cellComponent) => cellComponent || NbCalendarRangeDayCellComponent,
  });

  /**
   * Custom month cell component. Have to implement `NbCalendarCell` interface.
   * Falsy values keep the default range month cell.
   * */
  readonly monthCellComponent = input<
    Type<NbCalendarCell<D, NbCalendarRange<D>>>,
    Type<NbCalendarCell<D, NbCalendarRange<D>>> | null | undefined
  >(NbCalendarRangeMonthCellComponent, {
    transform: (cellComponent) => cellComponent || NbCalendarRangeMonthCellComponent,
  });

  /**
   * Custom year cell component. Have to implement `NbCalendarCell` interface.
   * Falsy values keep the default range year cell.
   * */
  readonly yearCellComponent = input<
    Type<NbCalendarCell<D, NbCalendarRange<D>>>,
    Type<NbCalendarCell<D, NbCalendarRange<D>>> | null | undefined
  >(NbCalendarRangeYearCellComponent, {
    transform: (cellComponent) => cellComponent || NbCalendarRangeYearCellComponent,
  });

  /**
   * Size of the calendar and entire components.
   * Can be 'medium' which is default or 'large'.
   * */
  readonly size = input<NbCalendarSize, NbCalendarSize | NbCalendarSizeValues>(NbCalendarSize.MEDIUM, {
    transform: (value) => value as NbCalendarSize,
  });

  readonly visibleDate = input<D>();

  /**
   * Determines should we show calendars navigation or not.
   * */
  readonly showNavigation = input<boolean>(true);

  /**
   * Range which will be rendered as selected.
   *
   * Kept as a decorator input backed by a signal: the component mutates it while a range is being
   * picked and the rangepicker assigns `picker.range` as a plain property.
   * */
  @Input()
  get range(): NbCalendarRange<D> {
    return this._range();
  }
  set range(range: NbCalendarRange<D>) {
    this._range.set(range);
  }
  private readonly _range = signal<NbCalendarRange<D>>(undefined);

  /**
   * Determines should we show week numbers column.
   * False by default.
   * */
  readonly showWeekNumber = input(false, { transform: convertToBoolProperty });

  /**
   * Sets symbol used as a header for week numbers column
   * */
  readonly weekNumberSymbol = input<string>('#');

  /**
   * Sets first day of the week, it can be 1 if week starts from monday and 0 if from sunday and so on.
   * `undefined` means that default locale setting will be used.
   * */
  readonly firstDayOfWeek = input<number | undefined>();

  /**
   * Emits range when start selected and emits again when end selected.
   * */
  @Output() rangeChange: EventEmitter<NbCalendarRange<D>> = new EventEmitter();

  constructor(protected dateService: NbDateService<D>) {}

  onChange(date: D) {
    this.initDateIfNull();
    this.handleSelected(date);
  }

  private initDateIfNull() {
    if (!this.range) {
      this.range = { start: null, end: null };
    }
  }

  private handleSelected(date: D) {
    if (this.selectionStarted()) {
      this.selectEnd(date);
    } else {
      this.selectStart(date);
    }
  }

  private selectionStarted(): boolean {
    const { start, end } = this.range;
    return start && !end;
  }

  private selectStart(start: D) {
    this.selectRange({ start });
  }

  private selectEnd(date: D) {
    const { start } = this.range;

    if (this.dateService.compareDates(date, start) > 0) {
      this.selectRange({ start, end: date });
    } else {
      this.selectRange({ start: date, end: start });
    }
  }

  private selectRange(range: NbCalendarRange<D>) {
    this.range = range;
    this.rangeChange.emit(range);
  }
}
