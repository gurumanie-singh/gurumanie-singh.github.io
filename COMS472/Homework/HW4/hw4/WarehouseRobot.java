import java.util.*;

public class WarehouseRobot {
    public static List<Move> solve(String inputFileName, Heuristic h) throws Exception {
        // Setup heuristic and initialize the initial state
        State.heuristic = h;
        State initial = new State(inputFileName);

        PriorityQueue<StateNode> open = new PriorityQueue<>(Comparator.comparingInt(n -> n.state.cost()));
        Map<State, Integer> visited = new HashMap<>();

        // Add the initial state to frontier (no parent, no move)
        open.add(new StateNode(initial, null, null));
        visited.put(initial, initial.getG());

        // Only exit when no states left
        while (!open.isEmpty()) {
            StateNode node = open.poll();
            State current = node.state;

            if (current.isGoal()) return reconstructPath(node);

            // Skip if we've already processed a cheaper path to this state
            Integer best = visited.get(current);
            if (best != null && best < current.getG()) continue;

            for (Move m : Move.values()) {
                try {
                    State next = current.successorState(m);
                    Integer prev = visited.get(next);
                    if (prev == null || next.getG() < prev) {
                        visited.put(next, next.getG());
                        open.add(new StateNode(next, node, m));
                    }
                } catch (IllegalArgumentException ignored) {}
            }
        }
        return null;
    }

    // This method is to walk back up to the parent chain and reconstruct the move list
    private static List<Move> reconstructPath(StateNode goal) {
        LinkedList<Move> moves = new LinkedList<>();
        StateNode current = goal;
        while (current.parent != null) {
            moves.addFirst(current.move);
            current = current.parent;
        }
        return moves;
    }

    // As discussed in lecture (for better memory efficiency)
    private static class StateNode {
        State state;
        StateNode parent;
        Move move;
        StateNode(State state, StateNode parent, Move move) {
            this.state = state;
            this.parent = parent;
            this.move = move;
        }
    }
}