import { Component, OnInit } from '@angular/core';
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

  onShiftMachineClicked(): void {
    // this.turingMachine.resetAll();
    this.turingMachine.intializeShiftRight();
  }
}
