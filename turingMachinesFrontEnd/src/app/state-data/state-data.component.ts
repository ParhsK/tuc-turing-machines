import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TuringMachineService } from '../turing-machine.service';
import { Delta, State } from '../utils';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-state-data',
  templateUrl: './state-data.component.html',
  styleUrls: ['./state-data.component.css']
})
export class StateDataComponent implements OnInit {

  state?: State;
  deltas: Delta[] = [];
  input: string = '';
  nextStateId?: number;

  constructor(@Inject (MAT_DIALOG_DATA) public data: number, public dialogRef: MatDialogRef<StateDataComponent>, public turingMachine: TuringMachineService) { }

  ngOnInit(): void {
    this.state = this.turingMachine.getStateById(this.data);
    this.turingMachine.deltas$.subscribe((deltas) => { this.deltas = this.turingMachine.getDeltasById(this.data); });
    this.deltas = this.turingMachine.getDeltasById(this.data);
  }

  onAddClicked(): void {
    if (this.nextStateId === undefined){
      throw Error('undefined next state id');
    }
    this.turingMachine.addDelta(this.state!.id, this.input, this.nextStateId);
  }

  onDeleteClicked(delta: Delta): void {
    console.log(delta.prevStateId, delta.input, delta.newStateId)
    this.turingMachine.deleteDelta(delta.prevStateId, delta.input, delta.newStateId);
  }
}
