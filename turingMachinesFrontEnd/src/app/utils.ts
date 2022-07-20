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

export function sleep(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds);
  });
}
