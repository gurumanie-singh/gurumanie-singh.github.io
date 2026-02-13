# Lecture 03

## Agent

- Input: Percept
- Output: Action
- Agent = Architecture + Agent Program
  - Architecture - Computing Device & Physical Sensors & Actuators
    - Make percept available to the program, run program, feed action to actuator.
  - **Agent Program** - Focus of this class
    - Input: current percept
      - If history is needed, then the program needs to remember it.
    - Output: action to be executed by the actuators

### Simple Reflex Agent

- Simple but limited intelligence
- Decision is based only on the current percept, no history involved
- Implemented with condition-action rule
  - Collection of logic gates (bunch of if-else statements)
  - "Neural" circuit (ANN)
- Sensor (percept) -> What is the world right now? -> What action should I take? (if-else statements) -> Actuators
- Limitations:
  - Partially observable environment

---

_Simple Reflex Agent (percept)_

- Persist: rules
- state <- interpretInput(percept)
- rule <- ruleMatch(state, rules)
- action <- rules.ACTION
- return action

---

### Model-Based Reflex Agent

- Maintain "internal state" to handle partial observability
  - Keep track of the world, even the part we cannot see
- Sensor (percept) -> What is the world right now? **(State, Transition model, Sensor model)** -> What action should I take? (if-else statements) -> Actuators
- Update the state based on:
  - Transition model
    - How the world works/evolves (somewhat records the knowledge of the world and sensors to keep track of the world)
  - Sensor model
    - How the world is reflected in the percept

---

_Model-Based Reflex Agent (percept)_

- Persist: rules, state, transitionModel, SensorModel, action
- state <- updateState(prev.state, prev.action, curr.percept, transitionModel, sensorModel) **Most likely state**
- rule <- ruleMatch(state, rules)
- action <- rules.ACTION
- return action

---

### Goal-Based Agent

- Care about the future
  - Goal satisfaction is not immediate from a single action
  - Require **search & planning** to find action sequence to achieve the goal
- Sensor (percept) -> What is the world right now? (State, Transition model, Sensor model) -> What the world would be like if I apply actions (a1, a2, ...) **(Transition Model)**-> **What action should I do now? (Goal)** -> Actuators
- Limitations:
  - Less efficient but more flexible

---

_Goal-Based Agent (percept)_

- Persist: state, transitionModel, SensorModel, action
- state <- updateState(prev.state, prev.action, curr.percept, transitionModel, sensorModel) **Most likely state**
- seq. of actions <- plan (curr.state, transitionModel)
- action <- rules.ACTION[0]
- return action

---

### Utility-Based Agent

- Include performance measure
  - Utility function (performance measure)
  - Maps a sequence of states to a real number
    - _real number_: how well did I do?
- Choose actions that maximize the expected utility
- Can be both Model-Based or Model-Free
