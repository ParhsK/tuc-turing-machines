import { MachineState, State, StateType, Action, Delta, EMPTY_INPUT } from "../utils";

export const shiftRightMachine = new MachineState(
  [
    new State(0, StateType.INITIAL_STATE, [Action.MOVE_LEFT], '690', '120'),
    new State(1, StateType.MIDDLE_STATE, [Action.WRITE_EMPTY, Action.MOVE_RIGHT, Action.WRITE_X, Action.MOVE_LEFT], '865', '120'),
    new State(2, StateType.FINAL_STATE, [Action.SEARCH_RIGHT_EMPTY, Action.SEARCH_RIGHT_EMPTY], '530', '260'),
  ],
  [
    new Delta(0, ['a', 'b'], 1),
    new Delta(1, ['a', 'b', EMPTY_INPUT], 0, 'top', 'top'),
    new Delta(0, [EMPTY_INPUT], 2, 'bottom', 'top'),
  ],
  [EMPTY_INPUT, 'a', 'a', 'b', 'a', 'b', EMPTY_INPUT],
  6,
  'This is the shift right machine example.'
);
