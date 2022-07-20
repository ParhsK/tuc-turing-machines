import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Delta, sleep, State, StateType } from './utils';

const EMPTY_INPUT = 'u';

@Injectable({
  providedIn: 'root',
})
export class TuringMachineService {
  private _states: Array<State> = [];
  private stateChange$ = new BehaviorSubject<Array<State>>([]);
  public states$ = this.stateChange$.asObservable();

  private _deltas: Array<Delta> = [];
  private deltaChange$ = new BehaviorSubject<Array<Delta>>([]);
  public deltas$ = this.deltaChange$.asObservable();

  input = '';
  tape: Array<string> = [];
  head = 0;
  currentState?: State;
  paused = false;
  alphabet = new Set<string>();

  constructor() {}

  set states(val: Array<State>) {
    this._states = val;
    this.updateStatesSubject();
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

  updateStatesSubject(): void {
    this.stateChange$.next(this.states);
  }

  fakeInitialize(): void {
    const states = [
       new State(0, StateType.INITIAL_STATE, ['L']),
       new State(1, StateType.MIDDLE_STATE, [EMPTY_INPUT, 'R', 'x', 'L']),
       new State(2, StateType.FINAL_STATE, ['Ru', 'Ru']),
    ];
    const deltas = [
       new Delta(0, ['a', 'b'], 1),
       new Delta(1, ['a', 'b', EMPTY_INPUT], 0, 'top', 'top'),
       new Delta(0, [EMPTY_INPUT], 2 , 'bottom', 'top'),
    ];
     this.newTape(['', 'a', 'a', 'b', 'a', 'b', '']);
    this.initializeMachine(states, deltas);
    this.head = 6;
  }

  initializeMachine(states: Array<State>, deltas: Array<Delta>): void {
    this.states = states;
    this.deltas = deltas;
    this.currentState = this.getInitialState();
  }

  getNextState(currentState: State, input: string): State {
    console.log('Current state id is', currentState.id);
    const formattedInput = input || EMPTY_INPUT;
    const currentDelta = this.deltas.find((delta) => {
      if (delta.prevStateId === currentState.id && delta.input.includes(formattedInput)) {
        return true;
      }
      return false;
    });
    if (currentDelta === undefined) {
      throw Error('undefined delta result');
    }
    const nextStateId = currentDelta.newStateId;
    console.log('Next state id is', nextStateId);
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

  getMaxStateId(): number {
    return this.states[this.states.length - 1].id + 1;
  }

  addToAlphabet(symbol: string): void {
    this.alphabet.add(symbol);
  }

  deleteFromAlphabet(symbol: string): void {
    this.alphabet.delete(symbol);
  }

  addState(): void {
    const newId = this.getMaxStateId();
    const newState = new State(newId, StateType.MIDDLE_STATE, ['']);
    this.states.push(newState);
    this.updateStatesSubject();
  }

  addDelta(currentStateId: number, input: Array<string>, newStateId: number): void {
    const newDelta = new Delta(currentStateId, input, newStateId);
    const newDeltas = this.deltas;
    newDeltas.push(newDelta);
    this.deltas = newDeltas;
  }

  addAction(stateId: number, action: string): void {
    const state = this.getStateById(stateId);
    state?.actions.push(action);
    this.updateStatesSubject();
  }

  deleteAction(stateId: number): void {
    const state = this.getStateById(stateId);
    state?.actions.pop();
  }

  deleteDelta(stateId: number, input: Array<string>, newStateId: number): void {
    console.log(stateId, input, newStateId);
    console.log(JSON.parse(JSON.stringify(this.deltas)));
    const index = this.deltas.findIndex((delta) => {
      if (
        delta.newStateId === newStateId &&
        delta.input === input &&
        delta.prevStateId === stateId
      ) {
        return true;
      }
      return false;
    });
    if (index === -1) {
      console.log('delta not found!');
      return;
    }
    const newDeltas = this.deltas;
    console.log(index);
    newDeltas.splice(index, 1);
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
    if (this.currentState?.type === StateType.FINAL_STATE) {
      console.log('Machine is in a final state.');
      return true;
    }
    return false;
  }

  newTape(tape: Array<string>) {
    console.log(`New tape`);
    this.tape = tape;
    this.head = 0;
  }

  addToTape(symbol: string) {
    if (this.tape.length < 1) {
      this.tape.push('');
      this.tape.push(symbol);
      this.tape.push('');
    } else {
      this.tape.pop();
      this.tape.push(symbol);
      this.tape.push('');
    }
  }

  deleteFromTape() {
    this.tape.pop();
  }

  moveTape(): void {
    this.currentState?.actions.forEach((action) => {
      switch (action) {
        case 'R':
          this.head++;
          break;
        case 'L':
          if (this.head === 0) {
            throw Error('unable to move further left');
          }
          this.head--;
          break;
        case 'Ru':
          for (let i = this.head; i < this.tape.length; i++) {
            if (this.tape[i] === '') {
              this.head = i;
              break;
            }
          }
          break;
        case 'Lu':
          for (let i = this.head; i <= 0; i--) {
            if (this.tape[i] === '') {
              this.head = i;
              break;
            }
          }
          break;
        case 'u':
          this.tape[this.head] = '';
          break;
        case 'x':
          this.tape[this.head] = this.input;
          break;
        }
    });
    if (this.head > this.tape.length - 1) {
      const currentLength = this.tape.length;
      const targetLength = this.head + 1;
      for (let i = currentLength; i <= targetLength; i++) {
        this.tape.push('');
      }
    }
    if (this.tape[this.tape.length - 1] !== '') {
      this.tape.push('');
    }
    console.log(`Head is now at ${this.head}`);
  }

  isSymbolUsed(symbol: string): boolean {
    const symbolIsUsedInTape = this.tape.includes(symbol);
    const symbolIsUsedInDeltas = this.deltas
      .reduce((allDeltaInputs: Array<string>, delta: Delta) => {
        delta.input.forEach((inputSymbol) => {
          allDeltaInputs.push(inputSymbol);
        })
        return allDeltaInputs;
      }, [])
      .includes(symbol);
    if (symbolIsUsedInDeltas || symbolIsUsedInTape) {
      return true;
    }
    return false;
  }

  async machineRun(): Promise<void> {
    this.currentState = this.getInitialState();
    while (this.isFinal() === false && this.paused === false) {
      this.stepRun();
      await sleep(300);
    }
    this.moveTape();
    return;
  }

  getInitialState(): State | undefined {
    //return this.states.find((state: State) => {
    //return state.type === 'initialState';
    // })
    return this.states[0];
  }
}
