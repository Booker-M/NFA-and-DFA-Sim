import test from 'ava';

import DeterministicFiniteStateMachine, { DFADescription } from './DeterministicFiniteStateMachine';
import NondeterministicFiniteStateMachine, { NFADescription } from './NondeterministicFiniteStateMachine';
import { NFAtoDFA } from './NFAtoDFA';

const dfaTests: {
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

const nfaTests: {
    [name: string]: {
        description: NFADescription,
        accepted: string[],
        rejected: string[],
    }
} = {
    startsWith0: {
        description: {
            transitions: {
                S: {0: ['A']},
                A: {0: ['A'], 1: ['A']},
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
                r0: {0: ['r0'], 1: ['r1']},
                r1: {0: ['r2'], 1: ['r0']},
                r2: {0: ['r1'], 1: ['r2']}
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
    },

    startsAndEndsWith1: {
        description: {
            transitions: {
                A: {1: ['B']},
                B: {0: ['B'], 1: ['B', 'C']},
                C: {}
            },
            start: 'A',
            acceptStates: ['C']
        },
        accepted: [
            '11',
            '101',
            '111',
            '110011001',
            '101111111101'
        ],
        rejected: [
            '',
            '1',
            '111110',
            '010101',
            '1010101110'
        ],
    },

    startsAndEndsWith1WithLambda: {
        description: {
            transitions: {
                A: {1: ['B']},
                B: {0: ['B'], 1: ['B', 'C']},
                C: {lambda: ['D']},
                D: {}
            },
            start: 'A',
            acceptStates: ['D']
        },
        accepted: [
            '11',
            '101',
            '111',
            '110011001',
            '101111111101'
        ],
        rejected: [
            '',
            '1',
            '111110',
            '010101',
            '1010101110'
        ],
    }

}

for(const [name, testDesc] of Object.entries(dfaTests)) {
    test(`${name}/dfa/constructor`, (t) =>{
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        t.truthy(dfa);
    });

    test(`${name}/dfa/transition`, (t) => {
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        const { transitions } = testDesc.description;
    
        for(const [state, stateTransitions] of Object.entries(transitions)) {
            for(const [symbol, nextState] of Object.entries(stateTransitions)) {
                t.assert(nextState === dfa.transition(state, symbol));
            }
        }
    });

    test(`${name}/dfa/accepts`, (t) => {
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

for(const [name, testDesc] of Object.entries(nfaTests)) {
    test(`${name}/nfa/constructor`, (t) =>{
        const nfa = new NondeterministicFiniteStateMachine(testDesc.description);
        t.truthy(nfa);
    });

    test(`${name}/nfa/transitions`, (t) => {
        const nfa = new NondeterministicFiniteStateMachine(testDesc.description);
        const { transitions } = testDesc.description;
    
        for(const [state, stateTransitions] of Object.entries(transitions)) {
            for(const [symbol, nextStates] of Object.entries(stateTransitions)) {
                t.assert(nextStates === nfa.stateTransitions(state, symbol));
            }
        }
    });

    test(`${name}/nfa/accepts`, (t) => {
        const nfa = new NondeterministicFiniteStateMachine(testDesc.description);
        const { accepted, rejected } = testDesc;
    
        for(const s of accepted) {
            t.assert(nfa.accepts(s));
        }

        for(const s of rejected) {
            t.assert(!nfa.accepts(s));
        }
    });
}

test(`NFAtoDFA`, (t) => {
    const nfa = new NondeterministicFiniteStateMachine(nfaTests['startsWith0'].description)
    const dfa = new DeterministicFiniteStateMachine(dfaTests['startsWith0'].description)
    t.assert(NFAtoDFA(nfa) === dfa);
});