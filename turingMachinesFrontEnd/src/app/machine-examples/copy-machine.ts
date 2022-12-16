import { Action, Delta, EMPTY_INPUT, MachineState, State, StateType } from "../utils";

export const copyMachine = {
  states: [
    new State(0, StateType.INITIAL_STATE, [Action.SEARCH_LEFT_EMPTY], '395', '170'),
    new State(1, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '545', '170'),
    new State(2, StateType.MIDDLE_STATE, [Action.WRITE_EMPTY, Action.SEARCH_RIGHT_EMPTY, Action.SEARCH_RIGHT_EMPTY, Action.WRITE_X, Action.SEARCH_LEFT_EMPTY, Action.SEARCH_LEFT_EMPTY, Action.WRITE_X], '650', '170'),
    new State(3, StateType.FINAL_STATE, [Action.SEARCH_RIGHT_EMPTY], '365', '300')
  ],
  deltas: [
    new Delta(0, ['a', 'b', EMPTY_INPUT], 1, 'right', 'left'),
    new Delta(1, ['a', 'b'], 2, 'right', 'left'),
    new Delta(2, ['a', 'b', EMPTY_INPUT], 1, 'right', 'top'),
    new Delta(1, [EMPTY_INPUT], 3, 'bottom', 'top')
  ],
  tape: [EMPTY_INPUT, 'a', 'b', 'a', EMPTY_INPUT, EMPTY_INPUT, EMPTY_INPUT],
  head: 4,
  alphabet: [EMPTY_INPUT, 'a', 'b'],
  text: 'This is the copy machine example.'
}
