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
  replaceEmptyCharacter,
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
  public alphabet$ = this.alphabetChange$.asObservable();

  public _head: number = 0;
  private headChange$ = new BehaviorSubject<number>(this._head);
  public head$ = this.headChange$.asObservable();

  public stateDialogOpen = new EventEmitter();
  public redrawEmitter = new EventEmitter();

  public text: string | null = '';
  input = '';
  tape: Array<string> = [];
  // head = 0;
  currentState?: State;
  currentDeltaIndex?: number;
  currentActionIndex = 0;
  paused = false;
  speed = 2;

  constructor(private _snackBar: MatSnackBar) {}

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
      alphabet: Array.from(this._alphabet),
      tape: this.tape,
      head: this._head,
      text: this.text,
    });
  }

  saveMachineState() {
    localStorage.setItem('machine', this.serializeMachineState());
  }

  // Read stored machine state from localStorage, deserialize and initialize machine
  loadMachineState(serializedStateInput?: string): void {
    let machineState = new MachineState([], [], []);
    const localMachineState = localStorage.getItem('machine');
    if (localMachineState) {
      console.log("Loading machine from memory");
      machineState = this.deserializeMachineState(localMachineState);
    }
    if (serializedStateInput) {
      console.log("Loading machine from file");
      machineState = this.deserializeMachineState(serializedStateInput);
    }
    console.log(machineState);

    this.setAll(machineState);
  }

  deserializeMachineState(serializedState: string): MachineState {
    const jsonMachineState = JSON.parse(serializedState);
    const states = jsonMachineState.states.map((jsonState: any) => {
      return new State(
        jsonState['id'],
        jsonState['type'],
        jsonState['actions'],
        jsonState['translateX'],
        jsonState['translateY']
      );
    });
    const deltas = jsonMachineState.deltas.map((jsonDelta: any) => {
      return new Delta(
        jsonDelta['prevStateId'],
        jsonDelta['input'],
        jsonDelta['newStateId'],
        jsonDelta['text'],
        jsonDelta['lineType'],
        jsonDelta['startSocket'],
        jsonDelta['endSocket']
      );
    });

    return new MachineState(
      states,
      deltas,
      jsonMachineState.tape,
      jsonMachineState.head,
      jsonMachineState.alphabet,
      jsonMachineState.text
    );
  }

  resetAll(): void {
    this.setAll(emptyMachine);
  }

  setAll(machineState: MachineState) {
    this.states = machineState.states;
    this.deltas = machineState.deltas;
    this.currentState = this.getInitialState();
    this._alphabet = new Set(machineState.alphabet);
    this.text = machineState.text;
    this.newTape(machineState.tape);
    this._head = machineState.head;
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
    const currentDelta = this.deltas[currentDeltaIndex];
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
    if (this.states.length === 0) {
      return 0;
    }
    return this.states[this.states.length - 1].id + 1;
  }

  addToAlphabet(symbol: string): void {
    this._alphabet.add(symbol);
    this.alphabetChange$.next(this._alphabet);
    this.redrawEmitter.emit();
    this.saveMachineState();
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
    this.saveMachineState();
  }

  changeStatePosition(stateId: number, x: string, y: string): void {
    const state = this.getStateById(stateId);
    if (!state) {
      return;
    }
    state.translateX = x;
    state.translateY = y;
    this.saveMachineState();
  }

  addDelta(
    currentStateId: number,
    input: Array<string>,
    newStateId: number,
    text: string
  ): void {
    const newDelta = new Delta(currentStateId, input, newStateId, text);
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
      this._snackBar.open(
        'This transition function makes the machine non-deterministic or already exists',
        'close'
      );
      return;
    }
    newDeltas.push(newDelta);
    this.deltas = newDeltas;
    this.redrawEmitter.emit();
    this.saveMachineState();
  }

  addAction(stateId: number, action: string): void {
    const state = this.getStateById(stateId);
    state?.actions.push(action);
    this.updateStatesSubject();
    this.redrawEmitter.emit();
    this.saveMachineState();
  }

  deleteAction(stateId: number): void {
    const state = this.getStateById(stateId);
    state?.actions.pop();
    this.updateStatesSubject();
    this.redrawEmitter.emit();
    this.saveMachineState();
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
      this._snackBar.open('Transition function not found', 'Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
      console.log('Transition function not found!');
      return;
    }
    const newDeltas = this.deltas;
    newDeltas.splice(index, 1);
    this.deltas = newDeltas;
    this.redrawEmitter.emit();
    this.saveMachineState();
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
    this.saveMachineState();
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
      this._snackBar.open('Machine is in a final state', 'Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
      console.log('Machine is in a final state.');
      return true;
    }
    return false;
  }

  validateTape(tape: Array<string>): {
    result: boolean;
    symbol: string | undefined;
  } {
    for (let i = 0; i < tape.length; i++) {
      if (!this._alphabet.has(tape[i])) {
        return { result: false, symbol: tape[i] };
      }
    }
    return { result: true, symbol: undefined };
  }

  idExists(stateId: number): boolean {
    return this._states.map((state) => state.id).includes(stateId);
  }

  newTape(tape: Array<string>) {
    let newTape = tape;
    // Check if all characters are in alphabet
    const tapeValidation = this.validateTape(tape);
    if (!tapeValidation.result) {
      this._snackBar.open(
        `Symbol ${replaceEmptyCharacter(
          tapeValidation.symbol!
        )} does not exist in alphabet`,
        'Close',
        { horizontalPosition: 'right', duration: 0 }
      );
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
    this._head = 0;
    this.headChange$.next(this._head);
    this.saveMachineState();
    return this.tape;
  }

  addToTape(symbol: string) {
    this.tape.pop();
    this.tape.push(symbol);
    this.tape.push(EMPTY_INPUT);
    this.saveMachineState();
  }

  deleteFromTape() {
    this.tape.pop();
    this.saveMachineState();
  }

  emptyTape() {
    this.tape.splice(0, this.tape.length);
    this.saveMachineState();
  }

  async performActions(): Promise<void> {
    if (this.currentState === undefined) {
      this.currentState = this.getInitialState();
    }
    const currentActions = this.currentState?.actions ?? [];
    for (const [index, action] of currentActions.entries()) {
      console.log(action);
      this.currentActionIndex = index;
      switch (action) {
        case Action.MOVE_RIGHT:
          this._head++;
          this.headChange$.next(this._head);
          break;
        case Action.MOVE_LEFT:
          if (this._head === 0) {
            this._snackBar.open('unable to move further left', 'Close', {
              horizontalPosition: 'right',
              duration: 0,
            });
            throw Error('unable to move further left');
          }
          this._head--;
          this.headChange$.next(this._head);
          break;
        case Action.SEARCH_RIGHT_EMPTY:
          for (let i = this._head; i < this.tape.length; i++) {
            if (this.tape[i + 1] === EMPTY_INPUT) {
              this._head = i + 1;
              this.headChange$.next(this._head);
              break;
            }
          }
          break;
        case Action.SEARCH_LEFT_EMPTY:
          if (this._head === 0) {
            this._snackBar.open(
              'unable to move further left, empty symbol was not found',
              'Close',
              { horizontalPosition: 'right', duration: 0 }
            );
            throw Error(
              'unable to move further left, empty symbol was not found'
            );
          }
          for (let i = this._head; i >= 0; i--) {
            if (this.tape[i - 1] === EMPTY_INPUT) {
              this._head = i - 1;
              this.headChange$.next(this._head);
              break;
            }
          }
          break;
        case Action.WRITE_EMPTY:
          this.tape[this._head] = EMPTY_INPUT;
          break;
        case Action.WRITE_X:
          this.tape[this._head] = this.input;
          break;
        case Action.SEARCH_RIGHT_X:
          for (let i = this._head; i < this.tape.length; i++) {
            if (this.tape[i] === this.input) {
              this._head = i;
              this.headChange$.next(this._head);
              break;
            }
          }
          break;
        case Action.SEARCH_LEFT_X:
          for (let i = this._head; i <= 0; i--) {
            if (this.tape[i] === this.input) {
              this._head = i;
              this.headChange$.next(this._head);
              break;
            }
          }
          this._snackBar.open(
            'unable to move further left, symbol was not found',
            'Close',
            { horizontalPosition: 'right', duration: 0 }
          );
          throw Error('unable to move further left, symbol was not found');
        case Action.MARK:
          this.tape[this._head] = 'd';
          break;
        case Action.DECISION_YES:
          this._snackBar.open('Yes', 'Close', {
            horizontalPosition: 'right',
            duration: 0,
          });
          break;
        case Action.DECISION_NO:
          this._snackBar.open('No', 'Close', {
            horizontalPosition: 'right',
            duration: 0,
          });
          break;
        case Action.COPY:
          const w = this.tape.reduce((newTape: string[], character) => {
            if (character !== EMPTY_INPUT) {
              newTape.push(character);
            }
            return newTape;
          }, []);
          const EMPTY_TAPE: string[] = []
          this.tape = EMPTY_TAPE.concat(EMPTY_INPUT).concat(w).concat(EMPTY_INPUT).concat(w).concat(EMPTY_INPUT)
          break;
        case Action.SHIFT_RIGHT:
          break;
        default:
          if (!this._alphabet.has(action)) {
            break;
          }
          this.tape[this._head] = action;
      }
      await sleep(500 - this.speed * 100);
    }
    if (this._head > this.tape.length - 1) {
      const currentLength = this.tape.length;
      const targetLength = this._head + 1;
      for (let i = currentLength; i <= targetLength; i++) {
        this.tape.push(' ');
      }
    }
    if (this.tape[this.tape.length - 1] !== ' ') {
      this.tape.push(' ');
    }
    console.log(`Head is now at ${this._head}`);
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
    while (this.isFinal() === false) {
      if (this.paused) {
        // Sleep to give control back to the browser
        await sleep(500);
        continue;
      }
      await this.stepRun();
    }
    // stepRun will take us to the last state but we still need to run the actions
    await this.performActions();
    return;
  }

  machinePauseResume(): void {
    this.paused = !this.paused;
    if (this.paused) {
      console.log('Paused');
      console.log('currentState:', this.currentState);
      this._snackBar.open('The machine is paused.', 'Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
    } else {
      this._snackBar.open('The machine is resumed.', 'Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
    }
  }

  setSpeed(newSpeed: number): void {
    this.speed = newSpeed;
  }

  async stepRun(): Promise<void> {
    if (this.getInitialState() === undefined) {
      this._snackBar.open('initial state missing','Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
      return;
    }
    await this.performActions();
    this.input = this.tape[this._head];
    if (this.currentState === undefined) {
      this._snackBar.open('undefined current state', 'Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
      throw Error('undefined current state');
    }
    if (this.currentState.type === StateType.FINAL_STATE) {
      this._snackBar.open('The machine has finished!', 'Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
      return;
    }
    console.log('Current state id is', this.currentState.id);
    const currentDelta = this.getCurrentDelta(this.currentState, this.input);
    this.redrawEmitter.emit();
    await sleep(500 - this.speed * 100);
    this.currentState = this.getNextState(currentDelta);
    this.currentDeltaIndex = undefined;
    await sleep(500 - this.speed * 100);
    console.log('Next state id is', this.currentState);
    return;
  }

  getInitialState(): State | undefined {
    return this.states.find((state: State) => {
      return state.type === StateType.INITIAL_STATE;
    });
  }

  moveHeadToStart(): void {
    this._head = 0;
    this.headChange$.next(this._head);
    this.saveMachineState();
  }

  moveHeadToEnd(): void {
    this._head = this.tape.length - 1;
    this.headChange$.next(this._head);
    this.saveMachineState();
  }

  moveHeadLeft(): void {
    if (this._head === 0) {
      this._snackBar.open('unable to move further left', 'Close', {
        horizontalPosition: 'right',
        duration: 0,
      });
      throw Error('unable to move further left');
    }
    this._head--;
    this.headChange$.next(this._head);
    this.saveMachineState();
  }

  moveHeadRight(): void {
    if (this._head >= this.tape.length - 1) {
      this.tape.push(' ');
      // this.head++;
    }
    this._head++;
    this.headChange$.next(this._head);
    this.saveMachineState();
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
