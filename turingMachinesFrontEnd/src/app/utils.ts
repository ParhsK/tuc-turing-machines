export class State {
  constructor(public id: number, public type: string, public actions: Array<string> ) {
  }
}

export class Delta {
  constructor(public prevStateId: number, public input: string, public newStateId: number) {
  }
}
