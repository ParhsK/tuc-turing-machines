export class State {
  constructor(
    public id: number,
    public type: StateType,
    public actions: Array<string>
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

export enum StateType {
  INITIAL_STATE = 'Initial',
  MIDDLE_STATE = 'Middle',
  FINAL_STATE = 'Final',
}

export enum Action {
  WRITE_EMPTY = '\u2294',
  MOVE_RIGHT = 'R',
  MOVE_LEFT = 'L',
  SEARCH_RIGHT_EMPTY = 'R\u2294',
  SEARCH_LEFT_EMPTY = 'L\u2294',
  WRITE_X = 'x',
  SEARCH_RIGHT_X = 'Rx',
  SEARCH_LEFT_X = 'Lx',
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
