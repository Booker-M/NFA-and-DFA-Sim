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

export default class DeterministicFiniteStateMachine {
    private description: DFADescription;

    constructor(description: DFADescription) {
        this.description = description;
    }

    getDescription(): DFADescription {
        return this.description;
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

    // accepts(s: string, state = this.description.start) {
    //     const { description: { acceptStates } } = this;
    //     const nextState = this.transition(state, s.charAt(0));

    //     return (s.length === 0) ? acceptStates.includes(state) : 
    //                             this.accepts(s.substr(1), nextState)
    // }
}