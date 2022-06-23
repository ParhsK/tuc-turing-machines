import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TuringMachineService {
  states: Array<State> = [];
  input = '';
  deltas: Array<Delta> = [];
  tape: Array<string> = [];
  head = 0;
  currentState?: State;
  paused = false;

  constructor() {}
  fakeInitialize(states: Array<State>, deltas: Array<Delta>) {
    states = [new State(0, 'R'), new State(1, 'R'), new State(2, 'finalState')];
    deltas = [new Delta(0, 'a', 1), new Delta(1, 'a', 1), new Delta(1, 'b', 2)];
  }
  initializeMachine(states: Array<State>, deltas: Array<Delta>) {
    this.states = states;
    this.deltas = deltas;
  }

  deltaResult() {
    const dr = this.deltas.find((delta) => {
      if (delta.prevState === this.currentState && delta.input === this.input) {
        return true;
      }
      return false;
    });
    if (dr === undefined) {
      throw Error('undefined delta result');
    }
    console.log(`New state is ${dr.newState}`);
    return dr.newState;
  }

  stepRun() {
    this.moveTape();
    this.input = this.tape[this.head];
    this.currentState = this.deltaResult();
    console.log(this.currentState);
    return;
  }

  newTape(tape: Array<string>) {
    console.log(`New tape`);
    this.tape = tape;
    this.head = 0;
  }

  isFinal() {
    if (this.currentState?.type === 'finalState') {
      console.log('Machine is in a final state.');
      return true;
    }
    return false;
  }

  moveTape() {
    if (this.currentState?.type === 'L' && this.head === 0) {
      throw Error();
    }
    if (this.currentState?.type === 'R') {
      this.head++;
    } else if (this.currentState?.type === 'L') {
      this.head--;
    }
    console.log(`Head is now at ${this.head}`);
    return;
  }

  machineRun() {
    this.currentState = this.getInitialState();
    while (this.isFinal() === false && this.paused === false) {
      this.stepRun();
    }
    return;
  }

  getInitialState(): State | undefined {
    return this.states.find((state: State) => {
      return state.type === 'initialState';
    })
  }
}

class State {
  id = '';
  type = '';
  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }
}

class Delta {
  prevState?: State;
  input = '';
  newState?: State;
  constructor(prevState: State, input: string, newState: State) {
    this.prevState = prevState;
    this.input = input;
    this.newState = newState;
  }
}
