import test from 'ava';

import DeterministicFiniteStateMachine, { DFADescription } from './DeterministicFiniteStateMachine';

const machineTests: {
    [name: string]: {
        description: DFADescription,
        accepted: string[],
        rejected: string[],
    }
} = {
    startsWith0: {
        description: {
            transitions: {
                S: {0: 'A', 1: 'B'},
                A: {0: 'A', 1: 'A'},
                B: {0: 'B', 1: 'B'}
            },
            start: 'S',
            acceptStates: ['A']
        },
        accepted: [
            '0',
            '01',
            '0000',
            '011111'
        ],
        rejected: [
            '',
            '10',
            '101',
            '10000',
            '1011111'
        ],
    },

    div3: {
        description: {
            transitions: {
                r0: {0: 'r0', 1: 'r1'},
                r1: {0: 'r2', 1: 'r0'},
                r2: {0: 'r1', 1: 'r2'}
            },
            start: 'r0',
            acceptStates: ['r0']
        },
        accepted: [
            '',
            '0',
            '000',
            '110',
            '101111111101'
        ],
        rejected: [
            '10',
            '1',
            '1000',
            '110101'
        ],
    }

}

for(const [name, testDesc] of Object.entries(machineTests)) {
    test(`${name}/constructor`, (t) =>{
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        t.truthy(dfa);
    });

    test(`${name}/transition`, (t) => {
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        const { transitions } = testDesc.description;
    
        for(const [state, stateTransitions] of Object.entries(transitions)) {
            for(const [symbol, nextState] of Object.entries(stateTransitions)) {
                t.assert(nextState === dfa.transition(state, symbol));
            }
        }
    });

    test(`${name}/accepts`, (t) => {
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        const { accepted, rejected } = testDesc;
    
        for(const s of accepted) {
            t.assert(dfa.accepts(s));
        }

        for(const s of rejected) {
            t.assert(!dfa.accepts(s));
        }
    });
}