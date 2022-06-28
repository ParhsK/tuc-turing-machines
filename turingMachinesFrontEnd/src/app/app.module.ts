import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule  } from '@angular/material/form-field';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MainPageComponent } from './main-page/main-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TuringMachineService } from './turing-machine.service';
import { CanvasComponent } from './canvas/canvas.component';
import { StateDataComponent } from './state-data/state-data.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    MainPageComponent,
    CanvasComponent,
    StateDataComponent
  ],
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatGridListModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,

  ],
  providers: [TuringMachineService],
  bootstrap: [AppComponent]
})
export class AppModule { }
