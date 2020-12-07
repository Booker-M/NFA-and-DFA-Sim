import DeterministicFiniteStateMachine from './DeterministicFiniteStateMachine';
import NondeterministicFiniteStateMachine, {NFADescription} from './NondeterministicFiniteStateMachine';

function combineTransitionStates(symbol, stateTransitions, nfaTransitions: NFADescription['transitions']) {
    for (const [key, value] of Object.entries(nfaTransitions[symbol])) {
        stateTransitions[key] = stateTransitions[key] ? [...{...stateTransitions[key], ...value}].sort() : value;
    }
    return stateTransitions;
}

export function NFAtoDFA(NFA: NondeterministicFiniteStateMachine): DeterministicFiniteStateMachine {
    let description = NFA.getDescription();
    description.transitions['dead'] = {0: ['dead'], 1: ['dead']} //add a dead state to the original transitions
    let newDescription = {
        transitions: {},
        start: null,
        acceptStates: []
    };

    let stack = [[description.start]];

    while (stack.length > 0) {
        let states = stack.pop();
        let state = states.join('');
        let newStates = [state];
        let newTransitions = [];
        for (const symbol of states) {
            combineTransitionStates(symbol, newTransitions, description.transitions);
        }

        if (newTransitions['lambda']) {
            for (const nextState of newTransitions['lambda']) { //combine with lambda moves' states
                newStates.push(nextState)
                combineTransitionStates(nextState, newTransitions, description.transitions);
            }
            delete newTransitions['lambda']; //no lambda moves in a DFA
        }

        for (let i = 0; i <= 1; i++) {
            if (!newTransitions[i]) { //if no transition, point to a dead state
                newTransitions[i] = ['dead'];
            }
        }

        for (const [key, value] of Object.entries(newTransitions)) { //combine each transition's states
            newTransitions[key] = value.join('');
            if (newTransitions[key] !== state && !newDescription.transitions[newTransitions[key]]) { stack.push(value) }
        }

        if (state === description.start) { //update start start
            newDescription.start = newStates.sort().join('');
        }

        if (description.acceptStates.some(state => newStates.includes(state))) { //update accept states
            newDescription.acceptStates.push(newStates.sort().join(''));
        }

        newDescription.transitions[newStates.sort().join('')] = newTransitions;
    }

    let dfa = new DeterministicFiniteStateMachine(newDescription)
    console.log(dfa.getDescription())
    return new DeterministicFiniteStateMachine(newDescription)
}