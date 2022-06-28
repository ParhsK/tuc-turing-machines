import { Injectable } from '@angular/core';
import { findIndex, Subject } from 'rxjs';
import { Delta, State } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TuringMachineService {
  private _states: Array<State> = [];
  private stateChange$ = new Subject<Array<State>>();
  public states$ = this.stateChange$.asObservable();

  private _deltas: Array<Delta> = [];
  private deltaChange$ = new Subject<Array<Delta>>();
  public deltas$ = this.deltaChange$.asObservable();

  input = '';
  tape: Array<string> = [];
  head = 0;
  currentState?: State;
  paused = false;

  constructor() {}

  set states(val: Array<State>) {
    this._states = val;
    this.stateChange$.next(val);
  }

  get states(): Array<State> {
    return this._states;
  }

  set deltas(val: Array<Delta>) {
    this._deltas = val;
    this.deltaChange$.next(val);
  }

  get deltas(): Array<Delta> {
    return this._deltas;
  }

  fakeInitialize(): void {
    const states = [new State(0, 'firstState', ['R']), new State(1, 'midState', ['R']), new State(2, 'finalState', [])];
    const deltas = [new Delta(0, 'a', 1), new Delta(1, 'a', 1), new Delta(1, 'b', 2)];
    this.newTape(['a','a','b']);
    this.initializeMachine(states, deltas);
  }

  initializeMachine(states: Array<State>, deltas: Array<Delta>): void {
    this.states = states;
    this.deltas = deltas;
    this.currentState = this.getInitialState();
  }

  getNextState(currentState: State, input: string): State {
    const currentDelta = this.deltas.find((delta) => {
      if (delta.prevStateId === currentState.id && delta.input === input) {
        return true;
      }
      return false;
    });
    if (currentDelta === undefined) {
      throw Error('undefined delta result');
    }
    const nextStateId = currentDelta.newStateId;
    console.log('Next state id is ${nextStateId');
    const nextState = this.getStateById(nextStateId);
    if (nextState === undefined) {
      throw Error('undefined next state');
    }
    return nextState;
  }

  stepRun(): void {
    this.moveTape();
    this.input = this.tape[this.head];
    if (this.currentState === undefined) {
      throw Error('undefined current state');
    }
    this.currentState = this.getNextState(this.currentState, this.input);
    console.log(this.currentState);
    return;
  }

  newTape(tape: Array<string>) {
    console.log(`New tape`);
    this.tape = tape;
    this.head = 0;
  }

  getMaxStateId(): number {
    return this.states[this.states.length - 1].id + 1;
  }

  addState(): void {
    const newId = this.getMaxStateId();
    const newState = new State(newId, '', ['']);
    const newStates = this.states;
    this.states.push(newState);
    this.states = newStates;
  }

  addDelta(currentStateId: number, input: string, newStateId: number): void {
    const newDelta = new Delta(currentStateId, input, newStateId);
    const newDeltas = this.deltas;
    newDeltas.push(newDelta);
    this.deltas = newDeltas;
  }

  deleteDelta(stateId: number, input: string, newStateId: number): void {
    console.log(stateId, input, newStateId);
    console.log(JSON.parse(JSON.stringify(this.deltas)));
    const index = this.deltas.findIndex((delta) => {
      if ((delta.newStateId === newStateId) && (delta.input === input) && (delta.prevStateId === stateId)) {
        return true;
      }
      return false;
    });
    if (index === -1) {
      console.log("delta not found!");
      return;
    }
    const newDeltas = this.deltas;
    console.log(index);
    newDeltas.splice(index,1);
    console.log(JSON.parse(JSON.stringify(newDeltas)));
    this.deltas = newDeltas;
  }

  getStateById(stateId: number): State | undefined {
    return this.states.find((state: State) => {
      if (state.id === stateId) {
        return true;
      }
      return false;
    });
  }

  getDeltasById(stateId: number): Delta[] {
    return this.deltas.filter((delta: Delta) => {
      if (delta.prevStateId === stateId) {
        return true;
      }
      return false;
    });
  }

  isFinal(): boolean {
    if (this.currentState?.type === 'finalState') {
      console.log('Machine is in a final state.');
      return true;
    }
    return false;
  }

  moveTape(): void {
    this.currentState?.actions.forEach((action) => {
      if (action === 'L' && this.head === 0) {
        throw Error();
      }
      if (action === 'R') {
        this.head++;
      }
      else if (action === 'L') {
        this.head--;
      }
      console.log(`Head is now at ${this.head}`);
    })

  }

  machineRun(): void {
    this.currentState = this.getInitialState();
    while (this.isFinal() === false && this.paused === false) {
      this.stepRun();
    }
    return;
  }

  getInitialState(): State | undefined {
    //return this.states.find((state: State) => {
      //return state.type === 'initialState';
   // })
    return this.states[0];
  }
}
