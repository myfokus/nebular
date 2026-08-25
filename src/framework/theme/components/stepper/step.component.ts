import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  input,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NbStepperComponent } from './stepper.component';
import { NB_STEPPER } from './stepper-tokens';
import { convertToBoolProperty, NbBooleanInput } from '../helpers';

/**
 * Component intended to be used within  the `<nb-stepper>` component.
 * Container for a step
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nb-step',
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `,
  standalone: false,
})
export class NbStepComponent {
  protected stepper: NbStepperComponent;

  // TODO static must be false as of Angular 9.0.0, issues/1514
  /**
   * Step content
   *
   * @type {TemplateRef}
   */
  @ViewChild(TemplateRef, { static: true }) content: TemplateRef<any>;

  /**
   * Top level abstract control of the step
   */
  readonly stepControl = input<{ valid: boolean | null; reset: () => void }>();

  /**
   * Step label
   *
   * @type {string|TemplateRef<any>}
   */
  readonly label = input<string | TemplateRef<any>>();

  /**
   * Whether step will be displayed in wizard
   *
   * @type {boolean}
   */
  readonly hidden = input(false, { transform: convertToBoolProperty });

  /**
   * Check that label is a TemplateRef.
   *
   * @return boolean
   * */
  get isLabelTemplate(): boolean {
    return this.label() instanceof TemplateRef;
  }

  /**
   * Whether step is marked as completed.
   *
   * @type {boolean}
   */
  @Input()
  get completed(): boolean {
    return this._completed() || this.isCompleted;
  }
  set completed(value: boolean) {
    this._completed.set(convertToBoolProperty(value));
  }
  private readonly _completed = signal(false);
  static ngAcceptInputType_completed: NbBooleanInput;

  protected get isCompleted() {
    const stepControl = this.stepControl();
    return stepControl ? stepControl.valid && this.interacted : this.interacted;
  }

  // Written by the parent stepper (markCurrentStepInteracted) and reset() — the signal
  // keeps parent-template reads of `completed` tracked under OnPush.
  get interacted(): boolean {
    return this._interacted();
  }
  set interacted(value: boolean) {
    this._interacted.set(value);
  }
  private readonly _interacted = signal(false);

  constructor(@Inject(NB_STEPPER) stepper) {
    this.stepper = stepper;
  }

  /**
   * Mark step as selected
   * */
  select(): void {
    this.stepper.selected = this;
  }

  /**
   * Reset step and stepControl state
   * */
  reset(): void {
    this.interacted = false;
    const stepControl = this.stepControl();
    if (stepControl) {
      stepControl.reset();
    }
  }
}
