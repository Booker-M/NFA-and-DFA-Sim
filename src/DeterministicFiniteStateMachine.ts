type State = string;
type InputSymbol = string;

export interface DFADescription {
    transitions: {
        [key:string]: {
            0: State,
            1: State
        }
    },
    start: State,
    acceptStates: State[]
}

export default class DFA {
    private description: DFADescription;

    constructor(description: DFADescription) {
        this.description = description;
    }

    getDescription(): DFADescription {
        return JSON.parse(JSON.stringify(this.description))
    }

    transition(state: State, symbol: InputSymbol): State {
        const { description: { transitions } } = this;
        return transitions[state][symbol];
    }

    accepts(s: string): boolean {
        const { description: { start, acceptStates } } = this;

        let state = start;

        for(const symbol of s) {
            state = this.transition(state, symbol);
        }

        return acceptStates.includes(state);
    }

    equals(dfa: DFA): boolean {
        return JSON.stringify(this.description) === JSON.stringify(dfa.getDescription())
    }
}