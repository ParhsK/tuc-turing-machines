import { MachineState, State, StateType, Action, Delta, EMPTY_INPUT } from "../utils";

export const decisionMachine = new MachineState(
  [
    new State(0, StateType.INITIAL_STATE, [Action.MOVE_RIGHT], '480', '220' ),
    new State(1, StateType.MIDDLE_STATE, [Action.MARK, Action.MOVE_RIGHT], '670', '220'),
    new State(2, StateType.MIDDLE_STATE, [Action.MARK, Action.MOVE_RIGHT], '850', '220'),
    new State(3, StateType.MIDDLE_STATE, [Action.MARK, Action.MOVE_RIGHT], '1050', '220'),
    new State(4, StateType.MIDDLE_STATE, [Action.SEARCH_LEFT_EMPTY], '1200', '220'),
    new State(5, StateType.FINAL_STATE, [Action.DECISION_YES], '200', '430'),
    new State(6, StateType.FINAL_STATE, [Action.DECISION_NO], '540', '430'),
  ],
  [
    new Delta(0, ['d'], 0),
    new Delta(0, ['a'], 1, 'right', 'left'),
    new Delta(1, ['d', 'a'], 1),
    new Delta(1, ['b'], 2, 'right', 'left'),
    new Delta(2, ['d', 'b'], 2),
    new Delta(2, ['c'], 3, 'right', 'left'),
    new Delta(3, ['c'], 3),
    new Delta(3, [EMPTY_INPUT], 4, 'right', 'left'),
    new Delta(4, ['a','b','c','d',EMPTY_INPUT], 0, 'right', 'top'),
    new Delta(0, [EMPTY_INPUT], 5, 'bottom', 'top'),
    new Delta(0, ['b', 'c'], 6, 'bottom', 'top'),
    new Delta(1, ['c', EMPTY_INPUT], 6, 'bottom', 'top'),
    new Delta(2, ['a', EMPTY_INPUT], 6, 'bottom', 'top'),
    new Delta(3, ['a', 'b', 'd'], 6, 'bottom', 'top'),
  ],
  [EMPTY_INPUT, 'a', 'b', 'c','a', 'b', 'c','a', 'b', 'c', EMPTY_INPUT],
  0,
  'decision machine'
);
