# Lecture 04

## Learning Agent

- Performance element: What we previously considered an entire agent
- Learning element: Make improvement in the performance element
  - uses the feedback from the critic on how the agent is doing & then determines how the performance element should be modified to do better
  - heavily depends on the design of the performance element
- Critic: Tells the learning element how well the agent is doing with respect to a fixed performance standard
- Problem Generator: Suggests actions that will lead to new & informative experience
  - eg: Might try identifying part of the model that needs improvement & suggest experiments

### Vision-Language-Action (VLA)

- Integrates visual perception, language understanding, and action generation
- Idea is to use the _language model_ as the "brain", connecting perception to action
  - visual input (images/video frames) are encoded into text-like representation (embeddings) that the language model can reason over
  - instead of connecting vision directly to motor control, the language layer allows the system to reason symbolically or semantically translate "what it sees" and "what it is told" into "what"

## Problem Solving Agent

- Could be Goal-based, Utility-based, Learning agent
- Has to consider a sequence of actions to achieve its goal
- Perform some sort of search
- Use atomic representation
  - meaning that the state of the world has no internal structure
  - later we will see planning agents that use factored or structured representations

## 2 Types of Search

- Informed search: Agent estimates how far a given state is from the goal
- Uninformed search: No such estimate is available (DFS, BFS, Dijstra's)

### Search Problem

**All are part of Deterministic Setting**
1. State Space (S): A set of possible states
   - captures all possible situations that could arise
   - discrete or continuous
   - each distinct situation is referred to as "state"
   - s(initial) is an element of S
   - s(G) is a subset of S
2. The set of actions (A)
   - an action manipulate states
     - ex: a = v (speed of car) 
     - action a, when applied on state s, produces a new state, say s'
   - The action space for each state s is an element of S is denoted by A(s) is a subset of A
3. A transition model / state transition function
   - f : S * A -> S
   - domain is S * A, range is S
   - such that s' = f(s,a)
   - describe how the state changes when actions are applied 
4. Action cost function
   - c : S * A * S -> R
   - such that c(s,a,s') gives the cost apply action a in state s to reach s' 

Path: a finite sequence of actions

Optimal Solution: Consider additive costs, i.e., given a path

### Formulating Problems

- Abstraction: Remove irrelevant details
  - "valid" if we can elaborate any abstract solution into a "" in the more detailed world
  - Appropriate level of abstraction: remove as much detail as possible while retaining validity & ensuring that the abstract actions are easy to carry out
- Ex: Planning on a grid
