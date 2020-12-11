type State = string;

import DFA from './DeterministicFiniteStateMachine';
import NFA, {NFADescription} from './NondeterministicFiniteStateMachine';

function combineTransitionStates(symbol, stateTransitions, nfaTransitions: NFADescription['transitions']) {
    for (const [key, value] of Object.entries(nfaTransitions[symbol])) {
        stateTransitions[key] = stateTransitions[key] ? 
                [...new Set([...stateTransitions[key], ...value])].sort() : value;
        for (const state of stateTransitions[key]) { //if any states have a lambda move, combine with it
            if (nfaTransitions[state] && nfaTransitions[state]['lambda']) {
                stateTransitions[key] = [...new Set([...stateTransitions[key], ...nfaTransitions[state]['lambda']])].sort()
            }
        }
    }
}

export function NFAtoDFA(nfa: NFA): DFA {
    let description = nfa.getDescription();
    //if any state is mentioned in a transition but not in transitions, add state: empty transition {}
    for (const stateTransitions of Object.values(description.transitions)) {
        for (const nextState of Object.values(stateTransitions).flatMap(e => e)) {
            if (!Object.keys(description.transitions).includes(nextState)) {
                description.transitions[nextState] = {}
            }
        }
    }
    let deadState = 'dead'
    while (Object.keys(description.transitions).includes(deadState)) { deadState += '*' } //ensures it's a new state name
    description.transitions[deadState] = {0: [deadState], 1: [deadState]} //add a dead state to the original transitions
    let newDescription = {
        transitions: {},
        start: null,
        acceptStates: []
    };

    let stack = [[description.start]];

    while (stack.length > 0) {
        let firstStates = [...stack[stack.length - 1]];
        let states = stack.pop();
        let newTransitions: {
            lambda?: State[],
            0?: State[],
            1?: State[]
        } = {};
        for (const symbol of states) {
            combineTransitionStates(symbol, newTransitions, description.transitions);
        }


        if (newTransitions['lambda']) {
            for (const nextState of newTransitions['lambda']) { //combine with lambda moves' states
                if (!states.includes(nextState)) { states.push(nextState) }
                combineTransitionStates(nextState, newTransitions, description.transitions);
            }
            delete newTransitions['lambda']; //no lambda moves in a DFA
        }


        let state = states.sort().join('');

        for (let i = 0; i <= 1; i++) {
            if (!newTransitions[i]) { //if no transition, point to a dead state
                newTransitions[i] = [deadState];
            }
        }

        for (const [key, value] of Object.entries(newTransitions)) { //combine each transition's states
            newTransitions[key] = [...value].join('');
            if (newTransitions[key] !== state && 
                    !newDescription.transitions[newTransitions[key]]) { stack.push([...value]) }
        }

        if (firstStates.length === 1 && firstStates[0] === description.start) { //update start start
            newDescription.start = state;
        }

        if (!newDescription.acceptStates.includes(state) && 
                description.acceptStates.some(state => states.includes(state))) { //update accept states
            newDescription.acceptStates.push(state);
        }

        newDescription.transitions[state] = {...newTransitions};
    }

    return new DFA(newDescription)
}