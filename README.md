# Finite State Automata
## By Booker Martin

In addition to adding expanding the DFA simulator done together in CMSI 385,
I have created an **NFA simulator** and two useful functions:
1. **NFA to DFA**
2. **DFA Minimizer**

I have included some NFA and DFA examples in the tests.spec.ts file,
including some equivalent NFAs and DFAs. My tests first convert the
NFA to DFA, then minimize both the new DFA and original DFA
(which also standardizes the state names). Finally, it checks if their descriptions
are equal. This test also prints out the NFAs and DFAs at each step.

Note: Since an NFA simulator, NFA to DFA converter, and DFA Minimizer
are all standalone projects, I have done all three for extra credit
(and because it was a fun challenge and I wanted to showcase my understanding)!
