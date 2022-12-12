import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { emptyMachine } from './machine-examples/empty-machine';
import {
  Delta,
  sleep,
  State,
  StateType,
  EMPTY_INPUT,
  Action,
  MachineState,
} from './utils';

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

  public _alphabet: Set<string> = new Set<string>();
  private alphabetChange$ = new BehaviorSubject<Set<string>>(this._alphabet);
  public alphabet$ = this.deltaChange$.asObservable();


  public stateDialogOpen = new EventEmitter();
  public redrawEmitter = new EventEmitter();

  public text: string | null = '';
  input = '';
  tape: Array<string> = [];
  head = 0;
  currentState?: State;
  currentDeltaIndex?: number;
  paused = false;
  speed = 2;


  constructor( private _snackBar: MatSnackBar ) {
    this.addToAlphabet(EMPTY_INPUT);
    this.addToAlphabet('a');
    this.addToAlphabet('b');
  }

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

  // Serialize and store machine state in localStorage
  serializeMachineState(): string {
    return JSON.stringify({
      states: this.states,
      deltas: this.deltas,
      tape: this.tape,
      head: this.head,
      text: this.text,
    });
  }

  saveMachineState() {
    localStorage.setItem(
      'machine',
      this.serializeMachineState()
    );
  }

  // Read stored machine state from localStorage, deserialize and initialize machine
  loadMachineState(): void {
    const machineState = this.deserializeMachineState();
    this.setAll(machineState);
  }

  deserializeMachineState(): MachineState {
    const serializedState = localStorage.getItem('machine');
    if (!serializedState) {
      return new MachineState([], [], []);
    }
    const jsonMachineState = JSON.parse(serializedState);
    return new MachineState(
      jsonMachineState.states,
      jsonMachineState.deltas,
      jsonMachineState.tape,
      jsonMachineState.head,
      jsonMachineState.text
    );
  }

  resetAll(): void {
    this.setAll(emptyMachine);
  }

  setAll(machineState: MachineState) {
    this.newTape(machineState.tape);
    this.states = machineState.states;
    this.deltas = machineState.deltas;
    this.currentState = this.getInitialState();
    this.head = machineState.head;
    this.text = machineState.text;
    this.saveMachineState();
  }

  getCurrentDelta(currentState: State, input: string): Delta {
    const formattedInput = input || EMPTY_INPUT;
    const currentDeltaIndex = this.deltas.findIndex((delta) => {
      if (
        delta.prevStateId === currentState.id &&
        delta.input.includes(formattedInput)
      ) {
        return true;
      }
      return false;
    });
    const currentDelta = this.deltas[currentDeltaIndex]
    if (currentDelta === undefined) {
      throw Error('undefined delta result');
    }
    this.currentDeltaIndex = currentDeltaIndex;
    return currentDelta;
  }

  getNextState(currentDelta: Delta): State {
    const nextStateId = currentDelta.newStateId;
    const nextState = this.getStateById(nextStateId);
    if (nextState === undefined) {
      throw Error('undefined next state');
    }
    return nextState;
  }

  getMaxStateId(): number {
    return this.states[this.states.length - 1].id + 1;
  }

  addToAlphabet(symbol: string): void {
    this._alphabet.add(symbol);
    this.alphabetChange$.next(this._alphabet);
    this.redrawEmitter.emit();
  }

  deleteFromAlphabet(symbol: string): void {
    // TODO: check if used in deltas or states
    this._alphabet.delete(symbol);

    // TODO: Maybe add updateAlphabetSubject() method
    this.alphabetChange$.next(this._alphabet);
  }

  addState(): void {
    const newId = this.getMaxStateId();
    const newState = new State(newId, StateType.MIDDLE_STATE, []);
    this.states.push(newState);
    this.updateStatesSubject();
    this.stateDialogOpen.emit(newState.id);
    this.redrawEmitter.emit();
  }

  changeStatePosition(stateId: number, x: string, y: string): void {
    const state = this.getStateById(stateId);
    if (!state) {
      return;
    }
    state.translateX = x;
    state.translateY = y;
  }

  addDelta(
    currentStateId: number,
    input: Array<string>,
    newStateId: number
  ): void {
    const newDelta = new Delta(currentStateId, input, newStateId);
    const newDeltas = this.deltas;
    // Validate is deterministic
    let isOk = true;
    this.deltas.forEach((delta) => {
      if (currentStateId === delta.prevStateId) {
        input.forEach((char) => {
          if (delta.input.includes(char)) {
            isOk = false;
          }
        });
      }
    });
    if (!isOk) {
      // alert('This delta makes the machine non-deterministic or already exists');
      this._snackBar.open('This transition function makes the machine non-deterministic or already exists', 'close');
      return;
    }
    newDeltas.push(newDelta);
    this.deltas = newDeltas;
    this.redrawEmitter.emit();
  }

  addAction(stateId: number, action: string): void {
    const state = this.getStateById(stateId);
    state?.actions.push(action);
    this.updateStatesSubject();
    this.redrawEmitter.emit();
  }

  deleteAction(stateId: number): void {
    const state = this.getStateById(stateId);
    state?.actions.pop();
    this.redrawEmitter.emit();
  }

  deleteDelta(stateId: number, input: Array<string>, newStateId: number): void {
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
      this._snackBar.open('Transition function not found', 'Close', {horizontalPosition: 'right', duration: 0})
      console.log('Transition function not found!');
      return;
    }
    const newDeltas = this.deltas;
    newDeltas.splice(index, 1);
    this.deltas = newDeltas;
    this.redrawEmitter.emit();
  }

  deleteState(stateId: number): void {
    const deltasToDelete: Array<Delta> = [];
    this.deltas.forEach((delta: Delta) => {
      if (stateId === delta.prevStateId || stateId === delta.newStateId) {
        deltasToDelete.push(delta);
      }
    });
    deltasToDelete.forEach((delta) => {
      this.deleteDelta(delta.prevStateId, delta.input, delta.newStateId);
    });
    this.states.splice(
      this.states.findIndex((state: State) => stateId === state.id),
      1
    );
    this.updateStatesSubject();
    this.redrawEmitter.emit();
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
      this._snackBar.open('Machine is in a final state', 'Close', {horizontalPosition: 'right', duration: 0})
      console.log('Machine is in a final state.');
      return true;
    }
    return false;
  }

  validateTape(tape: Array<string>): boolean {
    for (let i = 0; i < tape.length; i++) {
      if (!this._alphabet.has(tape[i])) {
        return false
      }
    }
    return true;
  }

  newTape(tape: Array<string>) {
    let newTape = tape;
    // Check if all characters are in alphabet
    if (!this.validateTape(tape)) {
      this._snackBar.open('Some symbol does not exist in alphabet', 'Close', {horizontalPosition: 'right', duration: 0})
      return this.tape;
    }
    // Enforce starts with empty
    if (newTape[0] != EMPTY_INPUT) {
      newTape = [EMPTY_INPUT].concat(newTape);
    }
    // Enforce ends with empty
    if (newTape.length > 0 && newTape[newTape.length - 1] != EMPTY_INPUT) {
      newTape = newTape.concat([EMPTY_INPUT]);
    }
    this.tape = newTape;
    this.head = 0;
    return this.tape;
  }

  addToTape(symbol: string) {
    this.tape.pop();
    this.tape.push(symbol);
    this.tape.push(EMPTY_INPUT);
  }

  deleteFromTape() {
    this.tape.pop();
  }

  emptyTape() {
    this.tape.splice(0, this.tape.length);
  }

  performActions(): void {
    console.log(this.currentState?.actions);
    this.currentState?.actions.forEach((action) => {
      switch (action) {
        case Action.MOVE_RIGHT:
          this.head++;
          break;
        case Action.MOVE_LEFT:
          if (this.head === 0) {
            this._snackBar.open('unable to move further left', 'Close', {horizontalPosition: 'right', duration: 0})
            throw Error('unable to move further left');
          }
          this.head--;
          break;
        case Action.SEARCH_RIGHT_EMPTY:
          for (let i = this.head; i < this.tape.length; i++) {
            if (this.tape[i + 1] === EMPTY_INPUT) {
              this.head = i + 1;
              break;
            }
          }
          break;
        case Action.SEARCH_LEFT_EMPTY:
          if (this.head === 0) {
            this._snackBar.open('unable to move further left, empty symbol was not found', 'Close', {horizontalPosition: 'right', duration: 0})
            throw Error(
              'unable to move further left, empty symbol was not found'
            );
          }
          for (let i = this.head; i >= 0; i--) {
            if (this.tape[i - 1] === EMPTY_INPUT) {
              this.head = i - 1;
              break;
            }
          }
          break;
        case Action.WRITE_EMPTY:
          this.tape[this.head] = EMPTY_INPUT;
          break;
        case Action.WRITE_X:
          this.tape[this.head] = this.input;
          break;
        case Action.SEARCH_RIGHT_X:
          for (let i = this.head; i < this.tape.length; i++) {
            if (this.tape[i] === this.input) {
              this.head = i;
              break;
            }
          }
          break;
        case Action.SEARCH_LEFT_X:
          for (let i = this.head; i <= 0; i--) {
            if (this.tape[i] === this.input) {
              this.head = i;
              break;
            }
          }
          this._snackBar.open('unable to move further left, symbol was not found', 'Close', {horizontalPosition: 'right', duration: 0})
          throw Error('unable to move further left, symbol was not found');
        case Action.MARK:
          this.tape[this.head] = 'd';
          break;
        case Action.DECISION_YES:
          // alert('Yes');
          this._snackBar.open('Yes', 'Close', {horizontalPosition: 'right', duration: 0});
          break;
        case Action.DECISION_NO:
          // alert('No');
          this._snackBar.open('No', 'Close', {horizontalPosition: 'right', duration: 0});
          break;
        default:
          if (!this._alphabet.has(action)) {
            break;
          }
          this.tape[this.head] = action;
      }
    });
    if (this.head > this.tape.length - 1) {
      const currentLength = this.tape.length;
      const targetLength = this.head + 1;
      for (let i = currentLength; i <= targetLength; i++) {
        this.tape.push(' ');
      }
    }
    if (this.tape[this.tape.length - 1] !== ' ') {
      this.tape.push(' ');
    }
    console.log(`Head is now at ${this.head}`);
  }

  isSymbolUsed(symbol: string): boolean {
    const symbolIsUsedInTape = this.tape.includes(symbol);
    const symbolIsUsedInDeltas = this.deltas
      .reduce((allDeltaInputs: Array<string>, delta: Delta) => {
        delta.input.forEach((inputSymbol) => {
          allDeltaInputs.push(inputSymbol);
        });
        return allDeltaInputs;
      }, [])
      .includes(symbol);
    if (symbolIsUsedInDeltas || symbolIsUsedInTape) {
      return true;
    }
    return false;
  }

  async machineRun(): Promise<void> {
    // this.loadMachineState();
    this.currentState = this.getInitialState();
    while (this.isFinal() === false ) {
      if (this.paused) {
        // Sleep to give control back to the browser
        await sleep(500);
        continue;
      }
      await this.stepRun();
    };
    // stepRun will take us to the last state but we still need to run the actions
    this.performActions();
    return;
  }

  machinePauseResume(): void {
    this.paused = !this.paused;
    if (this.paused) {
      console.log('Paused')
      console.log('currentState:', this.currentState)
      this._snackBar.open('The machine is paused.', 'Close', {horizontalPosition: 'right', duration: 0})
    } else {
      this._snackBar.open('The machine is resumed.', 'Close', {horizontalPosition: 'right', duration: 0})
    }
  }

  setSpeed(newSpeed: number): void {
    this.speed = newSpeed;
  }

  async stepRun(): Promise<void> {
    this.performActions();
    this.input = this.tape[this.head];
    if (this.currentState === undefined) {
      this._snackBar.open('undefined current state', 'Close', {horizontalPosition: 'right', duration: 0})
      throw Error('undefined current state');
    }
    if (this.currentState.type === StateType.FINAL_STATE) {
      this._snackBar.open('The machine has finished!', 'Close', {horizontalPosition: 'right', duration: 0})
      return;
    }
    console.log('Current state id is', this.currentState.id);
    const currentDelta = this.getCurrentDelta(this.currentState, this.input)
    this.redrawEmitter.emit();
    await sleep(500 - this.speed * 100);
    this.currentState = this.getNextState(currentDelta);
    this.currentDeltaIndex = undefined;
    await sleep(500 - this.speed * 100);
    console.log('Next state id is', this.currentState);
    return;
  }

  getInitialState(): State | undefined {
    //return this.states.find((state: State) => {
    //return state.type === 'initialState';
    // })
    return this.states[0];
  }

  moveHeadToStart(): void {
    this.head = 0;
  }

  moveHeadToEnd(): void {
    this.head = this.tape.length - 1;
  }

  moveHeadLeft(): void {
    if (this.head === 0) {
      this._snackBar.open('unable to move further left', 'Close', {horizontalPosition: 'right', duration: 0})
      throw Error('unable to move further left');
    }
    this.head--;
  }

  moveHeadRight(): void {
    if (this.head >= this.tape.length - 1) {
      this.tape.push(' ');
      // this.head++;
    }
    this.head++;
  }

  // Generate and download json with current state
  download() {
    const file = new Blob([this.serializeMachineState()], { type: '.json' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'machine-state';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
