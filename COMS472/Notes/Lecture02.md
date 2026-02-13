# Lecture 02

## Agents

- Takes input (percepts) through sensors from the environment
- Gives output (actions) through actuators to the environment

## Terminology

- Percepts
  - The contents of the agent's sensors perceived at any given instant
- Percept Sequence
  - The complete history of everything the agent has ever perceived
- Behavior
  - Agent function that maps any given percept sequence to an action
    - Agent function is an abstract description (agent function can be non-deterministic)
    - Agent program is what implements the agent function (concrete implementation)

# Good Behavior

## What does it mean to do the right thing?

- Maximize performance measure
  - "performance measure" - evaluates the desirability of any given sequence of environment state
- A rational agent selects an action among all valid/performable actions that are expected to maximize it's performance measure, given the evidence provided by the percept sequence and it's prior knowledge of the environment
  - "information gathering" - doing actions to modify future percepts
- Task environment
  - needs to be specified to determine an agent is rational
  - includes 4 elements:
    - performance measure
    - environment (operational driving domain)
    - agent's actuators
    - agent's sensors

## Categorization of Task Environment

- Fully Observable vs Partially Observable
- Single agent vs Multi agent
  - "multi agent" - can be broken down into collaborative or competitive
- Deterministic vs Non-Deterministic vs Stochastic
  - "deterministic" - next state is fully determined by current state and agent action
  - "non-deterministic" - not sure of likelihood of next state
  - "stochastic" - probability distribution over next possible state (basically still not sure of next possible state but can try to predict it)
- Episodic vs Sequential
- Static vs Dynamic vs Semi-Dynamic
  - "semi-dynamic" - environment does not change, but agent's performance might change over time
- Discrete (countable) vs Continuous (uncountable)
  - applies to both time and state
    - discrete-time, discrete-state
    - discrete-time, continuous-state
    - continous-time, continuous-state
- Known vs Unknown
  - agent's knowledge about the "laws of physics" of the environment
