import { NgModule } from '@angular/core';
import { BrowserModule, REMOVE_STYLES_ON_COMPONENT_DESTROY } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule } from '@myfokus/nebular-theme';
import { NbDateFnsDateModule } from '@myfokus/nebular-date-fns';
import { NbEvaIconsModule } from '@myfokus/nebular-eva-icons';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbDateFnsDateModule,
    NbEvaIconsModule,
  ],
  providers: [
    {
      provide: REMOVE_STYLES_ON_COMPONENT_DESTROY,
      useValue: false,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
