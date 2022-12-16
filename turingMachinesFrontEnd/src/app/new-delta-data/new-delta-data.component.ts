import { Component, OnInit } from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';

@Component({
  selector: 'app-new-delta-data',
  templateUrl: './new-delta-data.component.html',
  styleUrls: ['./new-delta-data.component.css']
})
export class NewDeltaDataComponent implements OnInit {

  startingNodeId?: number;
  input: string = '';
  endingNodeId?: number;

  constructor(
    public turingMachine: TuringMachineService
  ) { }

  ngOnInit(): void {
  }

  onDeltaAddClicked(): void {
    if (this.startingNodeId === undefined) {
      throw Error('undefined starting Node id');
    }
    if (this.input === undefined) {
      throw Error('undefined input');
    }
    if (this.endingNodeId === undefined) {
      throw Error('undefined ending Node id');
    }
    if (!this.turingMachine.idExists(this.startingNodeId)) {
      throw Error('starting Node Id does not exist');
    }
    if (!this.turingMachine.idExists(this.endingNodeId)) {
      throw Error('ending Node Id does not exist');
    }
    console.log(this.startingNodeId, this.input, this.endingNodeId);
    this.turingMachine.addDelta(this.startingNodeId, this.input.split(''), this.endingNodeId);
  }
}
