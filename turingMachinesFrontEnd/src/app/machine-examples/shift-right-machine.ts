import {
  MachineState,
  State,
  StateType,
  Action,
  Delta,
  EMPTY_INPUT,
} from '../utils';

export const shiftRightMachine = {
  states: [
    new State(0, StateType.INITIAL_STATE, [Action.MOVE_LEFT], '690', '120'),
    new State(
      1,
      StateType.MIDDLE_STATE,
      [Action.WRITE_EMPTY, Action.MOVE_RIGHT, Action.WRITE_X, Action.MOVE_LEFT],
      '866',
      '116'
    ),
    new State(
      2,
      StateType.FINAL_STATE,
      [Action.SEARCH_RIGHT_EMPTY, Action.SEARCH_RIGHT_EMPTY],
      '521',
      '262'
    ),
  ],
  deltas: [
    new Delta(0, ['a', 'b'], 1, '', 'grid', 'right', 'left'),
    new Delta(1, ['a', 'b', EMPTY_INPUT], 0, '', 'grid', 'top', 'top'),
    new Delta(0, [EMPTY_INPUT], 2, '', 'grid', 'bottom', 'top'),
  ],
  tape: [EMPTY_INPUT, 'a', 'a', 'b', 'a', 'b', EMPTY_INPUT],
  head: 6,
  alphabet: [EMPTY_INPUT, 'a', 'b'],
  text: 'This is the shift right machine example.',
};
