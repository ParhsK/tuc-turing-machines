import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TuringMachineService } from '../turing-machine.service';
import { Action, Delta, replaceEmptyCharacter, State, StateType } from '../utils';

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
  stateTypes: StateType[] = [
    StateType.INITIAL_STATE,
    StateType.MIDDLE_STATE,
    StateType.FINAL_STATE
  ];
  stateActions: string = ''

  allActions: Array<string> = Object.values(Action);
  alphabetActions: Array<string> = [];

  public replaceEmptyCharacter = (arr: Array<string>) => arr.map(c => replaceEmptyCharacter(c))

  constructor(
    @Inject (MAT_DIALOG_DATA) public data: number,
    public dialogRef: MatDialogRef<StateDataComponent>,
    public turingMachine: TuringMachineService,
  ) {}

  ngOnInit(): void {
    this.turingMachine.states$.subscribe((states) => {
      this.state = this.turingMachine.getStateById(this.data);
      this.stateActions = this.state?.actions.join('') ?? '';
    });
    this.turingMachine.deltas$.subscribe((deltas) => {
      this.deltas = this.turingMachine.getDeltasById(this.data);
    });
    this.turingMachine.alphabet$.subscribe((alphabet) => {
      this.alphabetActions = Array.from(this.turingMachine._alphabet).filter((c) => {
          return !this.allActions.includes(replaceEmptyCharacter(c));
      }).map((c) => {
        return replaceEmptyCharacter(c);
      })
    });
  }

  onDeltaAddClicked(): void {
    if (this.nextStateId === undefined) {
      throw Error('undefined next node id');
    }
    console.log(this.state!.id, this.input.split(''), this.nextStateId)
    this.turingMachine.addDelta(this.state!.id, this.input.split(''), this.nextStateId);
  }

  onDeltaDeleteClicked(delta: Delta): void {
    this.turingMachine.deleteDelta(delta.prevStateId, delta.input, delta.newStateId);
  }

  onActionClicked(stateId: number, action: string): void {
    this.turingMachine.addAction(stateId, action);
  }

  onActionDeleteClicked(stateId: number): void {
    this.turingMachine.deleteAction(stateId);
  }

  onStateDeleteClicked(stateId: number): void {
    this.turingMachine.deleteState(stateId);
  }
}
