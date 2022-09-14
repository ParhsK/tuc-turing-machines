import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { Delta, sleep, State, StateType, EMPTY_INPUT, Action } from './utils';


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

  public stateDialogOpen = new EventEmitter();
  public redrawEmitter = new EventEmitter();

  input = '';
  tape: Array<string> = [];
  head = 0;
  currentState?: State;
  paused = false;
  alphabet = new Set<string>();

  constructor() {
    this.alphabet.add(EMPTY_INPUT)
    this.alphabet.add('a')
    this.alphabet.add('b')
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
    });
  }

  saveMachineState(machineState: {states: State[], deltas: Delta[], tape: string[], head: number}) {
    localStorage.setItem('machine', JSON.stringify(this.serializeMachineState()));
  }

  // Read stored machine state from localStorage, deserialize and initialize machine
  loadMachineState(): void {
    const machineState = this.deserializeMachineState();
    this.setAll(machineState.states, machineState.deltas, machineState.tape, machineState.head);
  }

  deserializeMachineState(): { states: State[], deltas: Delta[], tape: string[], head: number } {
    const serializedState = localStorage.getItem('machine');
    if (!serializedState) {
      return {
        states: [],
        deltas: [],
        tape: [],
        head: 0,
      };
    }
    return JSON.parse(serializedState);
  }

  resetAll(): void {
    const states: Array<State> = [];
    const deltas: Array<Delta> = [];
    const tape: Array<string> = [];
    const head = 0;

    this.setAll(states, deltas, tape, head);
  }

  setAll(states: Array<State>, deltas: Array<Delta>, tape: Array<string>, head = 0) {
    this.newTape(tape);
    this.states = states;
    this.deltas = deltas;
    this.currentState = this.getInitialState();
    this.head = head;
    // this.redrawEmitter.emit();
  }

  getNextState(currentState: State, input: string): State {
    console.log('Current state id is', currentState.id);
    const formattedInput = input || EMPTY_INPUT;
    const currentDelta = this.deltas.find((delta) => {
      if (
        delta.prevStateId === currentState.id &&
        delta.input.includes(formattedInput)
      ) {
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
    if (this.currentState.type === StateType.FINAL_STATE) {
      console.log('The machine has finished!')
      return;
    }
    this.currentState = this.getNextState(this.currentState, this.input);
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
        })
      }
    })
    if (!isOk) {
      alert('This delta makes the machine non-deterministic or already exists');
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
      console.log('delta not found!');
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
        deltasToDelete.push(delta)
      }
    })
    deltasToDelete.forEach((delta) => {
      this.deleteDelta(delta.prevStateId, delta.input, delta.newStateId)
    })
    this.states.splice(this.states.findIndex((state: State) => stateId === state.id), 1);
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
      console.log('Machine is in a final state.');
      return true;
    }
    return false;
  }

  newTape(tape: Array<string>) {
    this.tape = tape;
    this.head = 0;
  }

  addToTape(symbol: string) {
    if (this.tape.length < 1) {
      this.tape.push(' ');
      this.tape.push(symbol);
      this.tape.push(' ');
    } else {
      this.tape.pop();
      this.tape.push(symbol);
      this.tape.push(' ');
    }
  }

  deleteFromTape() {
    this.tape.pop();
  }

  emptyTape() {
    this.tape.splice(0, this.tape.length)
  }

  moveTape(): void {
    console.log(this.currentState?.actions);
    this.currentState?.actions.forEach((action) => {
      switch (action) {
        case Action.MOVE_RIGHT:
          this.head++;
          break;
        case Action.MOVE_LEFT:
          if (this.head === 0) {
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
          if ( this.head === 0 )  {
            throw Error('unable to move further left, empty symbol was not found');
          }
          for (let i = this.head; i >= 0; i--) {
            console.log(i);
            if (this.tape[i - 1] === EMPTY_INPUT) {
              this.head = i - 1;
              console.log("mphka");
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
          throw Error('unable to move further left, symbol was not found');
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

  moveHeadToStart(): void {
    this.head = 0;
  }

  moveHeadToEnd(): void {
    this.head = this.tape.length - 1;
  }

  moveHeadLeft(): void {
    if (this.head === 0) {
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

  intializeCopyMachine(): void {
    const states = [
      new State(0, StateType.INITIAL_STATE, [Action.SEARCH_LEFT_EMPTY], '393', '171'),
      new State(1, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '543', '171'),
      new State(2, StateType.MIDDLE_STATE, [Action.WRITE_EMPTY, Action.SEARCH_RIGHT_EMPTY, Action.SEARCH_RIGHT_EMPTY, Action.WRITE_X, Action.SEARCH_LEFT_EMPTY, Action.SEARCH_LEFT_EMPTY, Action.WRITE_X], '651', '171'),
      new State(3, StateType.FINAL_STATE, [Action.SEARCH_RIGHT_EMPTY], '365', '302')
    ];
    const deltas = [
      new Delta(0, ['a', 'b', EMPTY_INPUT], 1, 'right', 'left'),
      new Delta(1, ['a', 'b'], 2, 'right', 'left'),
      new Delta(2, ['a', 'b', EMPTY_INPUT], 1, 'right', 'top'),
      new Delta(1, [EMPTY_INPUT], 3, 'bottom', 'top')
    ];
    const tape = [EMPTY_INPUT, 'a', 'b', 'a', EMPTY_INPUT, EMPTY_INPUT, EMPTY_INPUT];
    const head = 4;
    this.setAll(states, deltas, tape, head);
  }

  intializeShiftRightMachine(): void {
    const states = [
      new State(0, StateType.INITIAL_STATE, [Action.MOVE_LEFT], '693', '123'),
      new State(1, StateType.MIDDLE_STATE, [Action.WRITE_EMPTY, Action.MOVE_RIGHT, Action.WRITE_X, Action.MOVE_LEFT], '866', '123'),
      new State(2, StateType.FINAL_STATE, [Action.SEARCH_RIGHT_EMPTY, Action.SEARCH_RIGHT_EMPTY], '532', '257'),
    ];
    const deltas = [
      new Delta(0, ['a', 'b'], 1),
      new Delta(1, ['a', 'b', EMPTY_INPUT], 0, 'top', 'top'),
      new Delta(0, [EMPTY_INPUT], 2, 'bottom', 'top'),
    ];
    const tape = [EMPTY_INPUT, 'a', 'a', 'b', 'a', 'b', EMPTY_INPUT];
    const head = 6;
    this.setAll(states, deltas, tape, head);
  }

  intializeDecisionMachine(): void {
    const states = [
      new State(0, StateType.INITIAL_STATE, [Action.MOVE_LEFT], '693', '123'),
      new State(1, StateType.MIDDLE_STATE, [Action.WRITE_EMPTY, Action.MOVE_RIGHT, Action.WRITE_X, Action.MOVE_LEFT], '866', '123'),
      new State(2, StateType.FINAL_STATE, [Action.SEARCH_RIGHT_EMPTY, Action.SEARCH_RIGHT_EMPTY], '532', '257'),
    ];
    const deltas = [
      new Delta(0, ['a', 'b'], 1),
      new Delta(1, ['a', 'b', EMPTY_INPUT], 0, 'top', 'top'),
      new Delta(0, [EMPTY_INPUT], 2, 'bottom', 'top'),
    ];
    const tape = [EMPTY_INPUT, 'a', 'a', 'b', 'a', 'b', EMPTY_INPUT];
    const head = 6;
    this.setAll(states, deltas, tape, head);
  }

intializeRecursiveMachine(): void {
    const states = [
      new State(0, StateType.INITIAL_STATE, [Action.MOVE_LEFT], '693', '123'),
      new State(1, StateType.MIDDLE_STATE, [Action.WRITE_EMPTY, Action.MOVE_RIGHT, Action.WRITE_X, Action.MOVE_LEFT], '866', '123'),
      new State(2, StateType.FINAL_STATE, [Action.SEARCH_RIGHT_EMPTY, Action.SEARCH_RIGHT_EMPTY], '532', '257'),
    ];
    const deltas = [
      new Delta(0, ['a', 'b'], 1),
      new Delta(1, ['a', 'b', EMPTY_INPUT], 0, 'top', 'top'),
      new Delta(0, [EMPTY_INPUT], 2, 'bottom', 'top'),
    ];
    const tape = [EMPTY_INPUT, 'a', 'a', 'b', 'a', 'b', EMPTY_INPUT];
    const head = 6;
    this.setAll(states, deltas, tape, head);
  }



  // Generate and download json with current state
  download() {
    const file = new Blob([this.serializeMachineState()], {type: '.json'});
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'machine-state';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
  }
}
