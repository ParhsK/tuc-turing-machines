import { State, StateType, Action, Delta, EMPTY_INPUT } from "../utils";

export const decisionMachine = {
  states: [
    new State(0, StateType.INITIAL_STATE, [Action.MOVE_RIGHT], '319', '114' ),
    new State(1, StateType.MIDDLE_STATE, [Action.MARK], '500', '110'),
    new State(2, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '619', '80'),
    new State(3, StateType.MIDDLE_STATE, [Action.MARK], '785', '110'),
    new State(4, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '915', '80'),
    new State(5, StateType.MIDDLE_STATE, [Action.MARK], '1100', '110'),
    new State(6, StateType.MIDDLE_STATE, [Action.MOVE_RIGHT], '1215', '110'),
    new State(7, StateType.MIDDLE_STATE, [Action.SEARCH_LEFT_EMPTY], '1400', '50'),
    new State(8, StateType.FINAL_STATE, [Action.DECISION_YES], '20', '300'),
    new State(9, StateType.FINAL_STATE, [Action.DECISION_NO], '490', '280'),
  ],
  deltas: [
    new Delta(0, ['d'], 0, 'grid'),
    new Delta(0, ['a'], 1, 'grid', 'right', 'left'),
    new Delta(1, ['a', 'b', 'c', 'd', EMPTY_INPUT], 2, 'grid', 'right', 'left'),
    new Delta(2, ['a', 'd'], 2, 'grid'),
    new Delta(2, ['b'], 3, 'grid', 'right', 'left'),
    new Delta(3, ['a', 'b', 'c', 'd', EMPTY_INPUT], 4, 'grid', 'right', 'left'),
    new Delta(4, ['b', 'd'], 4, 'grid'),
    new Delta(4, ['c'], 5, 'grid', 'right', 'left'),
    new Delta(5, ['a','b','c','d',EMPTY_INPUT], 6, 'grid', 'right', 'left'),
    new Delta(6, ['c'], 6, 'grid'),
    new Delta(6, [EMPTY_INPUT], 7, 'grid', 'right', 'bottom'),
    new Delta(7, ['a', 'b', 'c', 'd', EMPTY_INPUT], 0, 'grid', 'top', 'top'),
    new Delta(0, [EMPTY_INPUT], 8, 'straight', 'bottom', 'top'),
    new Delta(0, ['b', 'c'], 9, 'straight', 'bottom', 'top'),
    new Delta(2, ['c', EMPTY_INPUT], 9, 'straight', 'bottom', 'top'),
    new Delta(4, ['a', EMPTY_INPUT], 9, 'straight', 'bottom', 'top'),
    new Delta(6, ['a', 'b', 'd'], 9, 'straight', 'bottom', 'top')
  ],
  tape: [EMPTY_INPUT, 'a', 'a', 'b','b', 'c','c', EMPTY_INPUT],
  head: 0,
  alphabet: [EMPTY_INPUT, 'a', 'b', 'c'],
  text: 'This is the decision machine example.'
};
