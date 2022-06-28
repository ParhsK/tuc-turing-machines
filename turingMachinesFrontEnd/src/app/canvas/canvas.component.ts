import { Component, OnInit } from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StateDataComponent } from '../state-data/state-data.component';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  constructor(public turingMachine: TuringMachineService, public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openDialog(stateId: number): void {
    this.dialog.open(StateDataComponent, {
      data: stateId,
    });
  }

}
