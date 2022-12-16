import { State, StateType, Action, Delta, EMPTY_INPUT } from "../utils";

export const decisionMachine = {
  states: [
    new State(0, StateType.INITIAL_STATE, [Action.MOVE_RIGHT], '320', '110' ),
    new State(1, StateType.MIDDLE_STATE, [Action.MARK], '500', '110'),
    new State(2, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '615', '70'),
    new State(3, StateType.MIDDLE_STATE, [Action.MARK], '785', '110'),
    new State(4, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '915', '70'),
    new State(5, StateType.MIDDLE_STATE, [Action.MARK], '1100', '110'),
    new State(6, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '1215', '110'),
    new State(7, StateType.MIDDLE_STATE, [Action.SEARCH_LEFT_EMPTY], '1400', '50'),
    new State(8, StateType.FINAL_STATE, [Action.DECISION_YES], '200', '430'),
    new State(9, StateType.FINAL_STATE, [Action.DECISION_NO], '540', '430'),
  ],
  deltas: [
    new Delta(0, ['d'], 0),
    new Delta(0, ['a'], 1, 'right', 'left'),
    new Delta(1, ['a', 'b', 'c', 'd', EMPTY_INPUT], 2, 'right', 'left'),
    new Delta(2, ['a', 'd'], 2),
    new Delta(2, ['b'], 3, 'right', 'left'),
    new Delta(3, ['a', 'b', 'c', 'd', EMPTY_INPUT], 4, 'right', 'left'),
    new Delta(4, ['b', 'd'], 4),
    new Delta(4, ['c'], 5, 'right', 'left'),
    new Delta(5, ['a','b','c','d',EMPTY_INPUT], 6, 'right', 'left'),
    new Delta(6, ['c'], 6),
    new Delta(6, [EMPTY_INPUT], 7, 'right', 'bottom'),
    new Delta(7, ['a', 'b', 'c', 'd', EMPTY_INPUT], 0, 'top', 'top'),
    new Delta(0, [EMPTY_INPUT], 8, 'bottom', 'top'),
    new Delta(0, ['b', 'c'], 9, 'bottom', 'top'),
    new Delta(2, ['c', EMPTY_INPUT], 9, 'bottom', 'top'),
    new Delta(4, ['a', EMPTY_INPUT], 9, 'bottom', 'top'),
    new Delta(6, ['a', 'b', 'd'], 9, 'bottom', 'top')
  ],
  tape: [EMPTY_INPUT, 'a', 'a', 'b','b', 'c','c', EMPTY_INPUT],
  head: 0,
  alphabet: [EMPTY_INPUT, 'a', 'b', 'c'],
  text: 'This is the decision machine example.'
};
