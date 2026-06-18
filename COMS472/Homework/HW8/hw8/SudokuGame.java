import java.util.*;


// Runs minimax for the Sudoku game tree
public class SudokuGame {
    /**
     * Picks the best move for MAX from the current state.
     * @param state current game state
     * @param alphaBeta included but not really used
     * @return the chosen move along with the number of nodes explored
     */
    public static Result solve(State state, Boolean alphaBeta) {
        int[] nodeCount = {0};

        // Count the starting state
        nodeCount[0]++;

        if (state.isGoal()) return new Result(null, nodeCount[0]);

        List<Move> legalMoves = state.getLegalMoves();
        if (legalMoves.isEmpty()) return new Result(null, nodeCount[0]);

        // Try each move and keep the best one for MAX
        Move bestMove = null;
        int  bestValue  = Integer.MIN_VALUE;

        for (Move m : legalMoves) {
            State next = state.successorState(m);
            int val = minimaxValue(next, nodeCount);
            if (val > bestValue) {
                bestValue  = val;
                bestMove = m;
            }
            if (bestValue == 1) break; // no need to keep searching after a guaranteed win
        }
        return new Result(bestMove, nodeCount[0]);
    }

    // Computes the minimax value for a state
    private static int minimaxValue(State state, int[] nodeCount) {
        nodeCount[0]++;

        if (state.isGoal()) return 1;

        List<Move> legalMoves = state.getLegalMoves();
        if (legalMoves.isEmpty()) return 0;

        if (state.turn) {
            // MAX is trying to force a win
            int best = 0;
            for (Move m : legalMoves) {
                int value = minimaxValue(state.successorState(m), nodeCount);
                if (value > best) best = value;
                if (best == 1) return 1; // stop if MAX already found a winning branch
            }
            return best;

        } else {
            // MIN is trying to force MAX to lose
            int best = 1;
            for (Move m : state.getLocallyLegalMoves()) {
                int val = minimaxValue(state.successorState(m), nodeCount);
                if (val < best) best = val;
                if (best == 0) return 0; // stop if MIN already found a losing branch for MAX
            }
            return best;
        }
    }
}