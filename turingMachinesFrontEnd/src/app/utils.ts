export class State {
  constructor(
    public id: number,
    public type: StateType,
    public actions: Array<string>,
    public translateX?: string,
    public translateY?: string,
  ) {}
}

export class Delta {
  constructor(
    public prevStateId: number,
    public input: Array<string>,
    public newStateId: number,
    public startSocket: 'right' | 'top' | 'bottom' | 'left' = 'right',
    public endSocket: 'right' | 'top' | 'bottom' | 'left' = 'left',
  ) {
  }
}

export class MachineState {
  constructor(
    public states: Array<State> = [],
    public deltas: Array<Delta> = [],
    public tape: Array<string> = [],
    public head: number = 0,
    public alphabet: Array<string> = [EMPTY_INPUT],
    public text: string = '',
  ) {
    // Deep copy input to avoid touching the original object references
    this.states = deepCopy(this.states);
    this.deltas = deepCopy(this.deltas);
    this.tape = deepCopy(this.tape);
    this.alphabet = deepCopy(this.alphabet);
    if (!this.alphabet.includes(EMPTY_INPUT)) {
      this.alphabet.push(EMPTY_INPUT);
    }
  }
}

export enum StateType {
  INITIAL_STATE = 'Initial',
  MIDDLE_STATE = 'Intermediate',
  FINAL_STATE = 'Final',
}

export enum Action {
  WRITE_EMPTY = '\u2294',
  MOVE_RIGHT = 'R',
  MOVE_LEFT = 'L',
  SEARCH_RIGHT_EMPTY = 'R\u2294',
  SEARCH_LEFT_EMPTY = 'L\u2294',
  SEARCH_RIGHT_X = 'Rx',
  SEARCH_LEFT_X = 'Lx',
  WRITE_X = 'X',
  MARK = 'd',
  DECISION_YES = 'yes',
  DECISION_NO = 'no'
}

export const EMPTY_INPUT = ' ';
export const EMPTY_DISPLAY_CHARACTER = '\u2294';

export function replaceEmptyCharacter(character: string): string {
  if (character == EMPTY_INPUT) {
    return EMPTY_DISPLAY_CHARACTER
  }
  return character
}

export function sleep(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds);
  });
}

export function deepCopy<T>(arr: Array<T>): Array<T> {
  return JSON.parse(JSON.stringify(arr));
}
