import { Component, OnInit } from '@angular/core';
import { copyMachine } from '../machine-examples/copy-machine';
import { decisionMachine } from '../machine-examples/decision-machine';
import { shiftRightMachine } from '../machine-examples/shift-right-machine';
import { myTuringMachine } from '../machine-examples/myTuringMachine';
import { TuringMachineService } from '../turing-machine.service';
import { MachineState } from '../utils';
import { MatDialog } from '@angular/material/dialog';
import { NewDeltaDataComponent } from '../new-delta-data/new-delta-data.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  constructor(
    public turingMachine: TuringMachineService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openNewDeltaDialog() {
    const dialogRef = this.dialog.open(NewDeltaDataComponent);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  updateSpeed(event: any): void {
    this.turingMachine.setSpeed(event);
  }

  onAddNodeClicked(): void {
    this.turingMachine.addState();
  }

  onPlayClicked(): void {
    this.turingMachine.machineRun();
  }

  onStepRunClicked(): void {
    this.turingMachine.stepRun();
  }

  onPauseClicked(): void {
    this.turingMachine.machinePauseResume();
  }

  onMyTuringMachineClicked(): void {
    this.turingMachine.setAll(
      new MachineState(
        myTuringMachine.states,
        myTuringMachine.deltas,
        myTuringMachine.tape,
        myTuringMachine.head,
        myTuringMachine.alphabet,
        myTuringMachine.text
      )
    );
  }

  onCopyingMachineClicked(): void {
    this.turingMachine.setAll(
      new MachineState(
        copyMachine.states,
        copyMachine.deltas,
        copyMachine.tape,
        copyMachine.head,
        copyMachine.alphabet,
        copyMachine.text
      )
    );
  }

  onShiftMachineClicked(): void {
    console.log(shiftRightMachine);
    this.turingMachine.setAll(
      new MachineState(
        shiftRightMachine.states,
        shiftRightMachine.deltas,
        shiftRightMachine.tape,
        shiftRightMachine.head,
        shiftRightMachine.alphabet,
        shiftRightMachine.text
      )
    );
  }

  onDecisionMachineClicked(): void {
    this.turingMachine.setAll(
      new MachineState(
        decisionMachine.states,
        decisionMachine.deltas,
        decisionMachine.tape,
        decisionMachine.head,
        decisionMachine.alphabet,
        decisionMachine.text
      )
    );
  }
}
