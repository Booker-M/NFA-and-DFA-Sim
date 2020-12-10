import DFA from './DeterministicFiniteStateMachine';

export function minimizeDFA(dfa: DFA): DFA {
    let description = dfa.getDescription();
    let newDescription = {
        transitions: {},
        start: 'q0',
        acceptStates: []
    };
    let nonAcceptStates = Object.keys(description.transitions).filter(state => !description.acceptStates.includes(state));
    let groups = [];
    let nextGroups =[[description.acceptStates, [null, null]], [nonAcceptStates, [null, null]]];

    while (JSON.stringify(groups) !== JSON.stringify(nextGroups)) { //continues until k-equivalence
        groups = nextGroups;
        nextGroups = [];
        for (let group of groups) {
            group[1] = [description.transitions[group[0][0]]['0'], description.transitions[group[0][0]]['1']]
            for (const state of group[0]) {
                const transition = [description.transitions[state]['0'], description.transitions[state]['1']]
                if (JSON.stringify(transition) !== JSON.stringify(group[1])) {
                    group[0].splice(group[0].indexOf(state), 1)
                    let newGroup = groups.find(g => g[1] === transition)
                    if (newGroup) {
                        newGroup.push(state)
                    } else {
                        nextGroups.push([[state], transition])
                    }
                }
            }
            if (group[0].length > 0) { nextGroups.push(group) }
        }
    }

    nextGroups = [];
    let i = 0;
    let stack = [];
    stack.push(groups.find(g => g[0].includes(description.start)))
    while (stack.length > 0) { //simplify/standardize state names
        let group = stack.pop()
        for (let otherGroup of [...groups, ...nextGroups]) { //update all groups' transitions
            if (group[0].includes(otherGroup[1][0])) { otherGroup[1][0] = `q${i}`}
            if (group[0].includes(otherGroup[1][1])) { otherGroup[1][1] = `q${i}`}
        }
        if (group[0].includes(description.start)) { description.start = `q${i}`} //update start start
        if (description.acceptStates.some(state => group[0].includes(state))) { //update accept states
            newDescription.acceptStates.push(`q${i}`)
        }
        groups.splice(groups.indexOf(group), 1)
        group[0] = [`q${i}`]
        nextGroups.push(group)
        for (const next of group[1].filter(s => groups.map(g => g[0][0]).includes(s))) {
            stack.push(groups.find(g => g[0][0] === next))
        }
        i++;
    }

    for (let group of nextGroups) { //add groups to newDescription.transitions
        newDescription.transitions[group[0][0]] = {0: group[1][0], 1: group[1][1]}
    }

    return new DFA(newDescription)
}