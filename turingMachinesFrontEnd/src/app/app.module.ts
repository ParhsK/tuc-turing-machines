import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule  } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MainPageComponent } from './main-page/main-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TuringMachineService } from './turing-machine.service';
import { CanvasComponent } from './canvas/canvas.component';
import { StateDataComponent } from './state-data/state-data.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TapeComponent } from './tape/tape.component';
import { TapeDataComponent } from './tape-data/tape-data.component';
import { StateCardComponent } from './state-card/state-card.component';
import { NewDeltaDataComponent } from './new-delta-data/new-delta-data.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    MainPageComponent,
    CanvasComponent,
    StateDataComponent,
    TapeComponent,
    TapeDataComponent,
    StateCardComponent,
    NewDeltaDataComponent
  ],
  imports: [
    BrowserModule,
    MatDividerModule,
    MatSnackBarModule,
    MatSliderModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatGridListModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    DragDropModule,
    MatSelectModule,
  ],
  providers: [TuringMachineService],
  bootstrap: [AppComponent]
})
export class AppModule { }
