type State = string;
type InputSymbol = string;

export interface NFADescription {
    transitions: {
        [key:string]: {
            lambda?: State[],
            0?: State[],
            1?: State[]
        }
    },
    start: State,
    acceptStates: State[]
}

export default class NFA {
    private description: NFADescription;

    constructor(description: NFADescription) {
        this.description = description;
    }

    getDescription(): NFADescription {
        return this.description;
    }

    allTransitions(states: State[], symbol: InputSymbol): State[] {
        return [...new Set(states.flatMap(state => this.stateTransitions(state, symbol)))]
    }

    stateTransitions(state: State, symbol: InputSymbol): State[] {
        const { description: { transitions } } = this;
        return (transitions[state] && transitions[state][symbol]) ? transitions[state][symbol] : [];
    }

    accepts(s: string, states = [this.description.start]) {
        const { description: { acceptStates } } = this;
        states = [...states, ...this.allTransitions(states, 'lambda')]
        const nextStates = this.allTransitions(states, s.charAt(0));

        return (s.length === 0) ? acceptStates.some(state => states.includes(state)) : 
                                this.accepts(s.substr(1), nextStates)
    }

    equals(nfa: NFA): boolean {
        return JSON.stringify(this.description) === JSON.stringify(nfa.getDescription())
    }
}