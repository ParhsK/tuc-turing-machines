import { Component, OnInit } from '@angular/core';
import { copyMachine } from '../machine-examples/copy-machine';
import { decisionMachine } from '../machine-examples/decision-machine';
import { recursiveMachine } from '../machine-examples/recursive-machine';
import { shiftRightMachine } from '../machine-examples/shift-right-machine';
import { TuringMachineService } from '../turing-machine.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  constructor(private turingMachine: TuringMachineService) { }

  ngOnInit(): void {
  }

  onAddClicked(): void {
    this.turingMachine.addState();

  }

  onPlayClicked(): void {
    this.turingMachine.machineRun();
  }

  onStepRunClicked(): void {
    this.turingMachine.stepRun();
  }

  onCopyingMachineClicked(): void {
    this.turingMachine.setAll(copyMachine);
  }

  onShiftMachineClicked(): void {
    this.turingMachine.setAll(shiftRightMachine);
  }

  onDecisionMachineClicked(): void {
    this.turingMachine.setAll(decisionMachine);
  }

  onRecursiveMachineClicked(): void {
    this.turingMachine.setAll(recursiveMachine);
  }
}
