import DFA from './DeterministicFiniteStateMachine';

export function minimizeDFA(dfa: DFA): DFA {
    let description = dfa.getDescription();
    let newDescription = {
        transitions: {},
        start: null,
        acceptStates: []
    };
    let nonAcceptStates = Object.keys(description.transitions).filter(state => !description.acceptStates.includes(state));
    let groups = [description.acceptStates, nonAcceptStates];
    let nextGroups =[];

    while (groups != nextGroups) {
        nextGroups = groups;
        
    }

    return new DFA(newDescription)
}