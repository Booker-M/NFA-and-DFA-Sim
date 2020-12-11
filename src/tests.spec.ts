import test from 'ava';

import DFA, { DFADescription } from './DeterministicFiniteStateMachine';
import NFA, { NFADescription } from './NondeterministicFiniteStateMachine';
import { NFAtoDFA } from './NFAtoDFA';
import { minimizeDFA } from './DFAMinimizer';

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
    },
    
    exam2problem3: {
        description: {
            transitions: {
                ab: {0: 'ab', 1: 'c'},
                c: {0: 'd', 1:'e'},
                d: {0: 'e', 1: 'e'},
                e: {0: 'e', 1: 'e'}
            },
            start: 'ab',
            acceptStates: ['d']
        },
        accepted: [
            '10',
            '010',
            '0010',
            '000010'
        ],
        rejected: [
            '100',
            '1010',
            '01010',
            '0000101'
        ]
    },

    /* This is the problem that Brightspace marked wrong on Exam 2 and we looked at in office hours.
    Thought it would be fun to compare my answer to the original NFA (in the NFA list).
    Sure enough, my DFA IS equivalent to the question's NFA (at least, according to my NFAtoDFA) */
    exam2problem4: {
        description: {
            transitions: {
                a: {0: 'b', 1: 'g'},
                b: {0: 'c', 1: 'g'},
                c: {0: 'd', 1: 'c'},
                d: {0: 'd', 1: 'e'},
                e: {0: 'f', 1: 'c'},
                f: {0: 'd', 1: 'e'},
                g: {0: 'g', 1: 'g'}
            },
            start: 'a',
            acceptStates: ['e']
        },
        accepted: [
            '0001',
            '00010001',
            '000101',
            '00101101',
        ],
        rejected: [
            '',
            '000',
            '10001',
            '001010'
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
            '1010101110',
            '1011111111010'
        ],
    },

    exam2problem3: {
        description: {
            transitions: {
                a: {0: ['b'], 1: ['c'], lambda: ['b']},
                b: {0: ['a']},
                c: {0: ['d']}
            },
            start: 'a',
            acceptStates: ['d']
        },
        accepted: [
            '10',
            '010',
            '0010',
            '000010'
        ],
        rejected: [
            '100',
            '1010',
            '01010',
            '0000101'
        ]
    },

    exam2problem4: {
        description: {
            transitions: {
                a: {0: ['b']},
                b: {0: ['c']},
                c: {0: ['c', 'd'], 1: ['c']},
                d: {1: ['e']},
                e: {lambda: ['a']},
            },
            start: 'a',
            acceptStates: ['e']
        },
        accepted: [
            '0001',
            '00010001',
            '000101',
            '00101101',
        ],
        rejected: [
            '',
            '000',
            '10001',
            '001010'
        ],
    },

    startsAndEndsWith1WithLambda: {
        description: {
            transitions: {
                A: {1: ['B']},
                B: {0: ['B'], 1: ['B', 'C']},
                C: {lambda: ['dead']},
                dead: {} //my NFAtoDFA creates a dead state,
            },           //but will add a * if 'dead' is taken like here
            start: 'A',
            acceptStates: ['dead']
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

/* tests each DFA's constructor, transitions, and acceptance */
for(const [name, testDesc] of Object.entries(dfaTests)) {
    test(`${name}/dfa/constructor`, (t) =>{
        const dfa = new DFA(testDesc.description);
        t.truthy(dfa);
    });

    test(`${name}/dfa/transition`, (t) => {
        const dfa = new DFA(testDesc.description);
        const { transitions } = testDesc.description;
    
        for(const [state, stateTransitions] of Object.entries(transitions)) {
            for(const [symbol, nextState] of Object.entries(stateTransitions)) {
                t.assert(nextState === dfa.transition(state, symbol));
            }
        }
    });

    test(`${name}/dfa/accepts`, (t) => {
        const dfa = new DFA(testDesc.description);
        const { accepted, rejected } = testDesc;
    
        for(const s of accepted) {
            t.assert(dfa.accepts(s));
        }

        for(const s of rejected) {
            t.assert(!dfa.accepts(s));
        }
    });
}

/* tests each NFA's constructor, transitions, and acceptance */
for(const [name, testDesc] of Object.entries(nfaTests)) {
    test(`${name}/nfa/constructor`, (t) =>{
        const nfa = new NFA(testDesc.description);
        t.truthy(nfa);
    });

    test(`${name}/nfa/transitions`, (t) => {
        const nfa = new NFA(testDesc.description);
        const { transitions } = testDesc.description;
    
        for(const [state, stateTransitions] of Object.entries(transitions)) {
            for(const [symbol, nextStates] of Object.entries(stateTransitions)) {
                t.assert(nextStates === nfa.stateTransitions(state, symbol));
            }
        }
    });

    test(`${name}/nfa/accepts`, (t) => {
        const nfa = new NFA(testDesc.description);
        const { accepted, rejected } = testDesc;
    
        for(const s of accepted) {
            t.assert(nfa.accepts(s));
        }

        for(const s of rejected) {
            t.assert(!nfa.accepts(s));
        }
    });
}

/* compares every NFA and DFA with the same name in the tests
by minimizing the DFA, converting the NFA to DFA, and minimizing
this NFAtoDFA*/
for(const [name, testDesc] of Object.entries(nfaTests)) {
    if (dfaTests[name]) {
        test(`${name}/minimizeDFA & NFAtoDFA`, (t) => {
            let dfa = new DFA(dfaTests[name].description)
            let minDFA = minimizeDFA(dfa)

            let nfa = new NFA(testDesc.description)
            let nfaToDFA = NFAtoDFA(nfa)
            let minNFAtoDFA = minimizeDFA(nfaToDFA);

            console.log(name)
            console.log('-------------')
            console.log("NFA:\n", JSON.stringify(nfa.getDescription()))
            console.log("NFAtoDFA:\n", JSON.stringify(nfaToDFA.getDescription()))
            console.log("DFA:\n", JSON.stringify(dfa.getDescription()))
            console.log("min NFAtoDFA:\n", JSON.stringify(minNFAtoDFA.getDescription()))
            console.log("min DFA:\n", JSON.stringify(minDFA.getDescription()), '\n')

            t.assert(JSON.stringify(minDFA.getDescription()) === JSON.stringify(minNFAtoDFA.getDescription()))
        })
    }
}

/* minimizes & compares two equivalent but differently implemented NFAs
by minimizing and converting both to DFAs (this standardizes state names)*/
test(`startsAndEndsWith1/minimizeDFA & NFAtoDFA`, (t) => {
    let nfa = new NFA(nfaTests['startsAndEndsWith1'].description)
    let nfaToDFA = NFAtoDFA(nfa)
    let minNFAtoDFA = minimizeDFA(nfaToDFA);

    let nfa2 = new NFA(nfaTests['startsAndEndsWith1WithLambda'].description)
    let nfaToDFA2 = NFAtoDFA(nfa2)
    let minNFAtoDFA2 = minimizeDFA(nfaToDFA2);

    console.log('startsAndEndsWith1')
    console.log('-------------')
    console.log("NFA:\n", JSON.stringify(nfa.getDescription()))
    console.log("NFA2:\n", JSON.stringify(nfa2.getDescription()))
    console.log("NFAtoDFA:\n", JSON.stringify(nfaToDFA.getDescription()))
    console.log("NFAtoDFA2:\n", JSON.stringify(nfaToDFA2.getDescription()))
    console.log("min NFAtoDFA:\n", JSON.stringify(minNFAtoDFA.getDescription()))
    console.log("min NFAtoDFA2:\n", JSON.stringify(minNFAtoDFA2.getDescription()), '\n')

    t.assert(JSON.stringify(minNFAtoDFA.getDescription()) === JSON.stringify(minNFAtoDFA2.getDescription()))
});