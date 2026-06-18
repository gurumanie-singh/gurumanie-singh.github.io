import java.util.*;
import java.io.*;


/**
 * Represents one Sudoku board configuration.
 * MAX moves first, and turns alternate after that.
 */
public class State {

    final int N; // board size
    final int k; // subgrid width/height
    final int[][] board; // 0 means the cell is still empty
    final boolean turn; // true for MAX, false for MIN

    private final int[][] neighbors;

    // Builds the initial state from an input file
    public State(String inputFile) throws FileNotFoundException, IllegalArgumentException {
        File file = new File(inputFile);
        Scanner scan = new Scanner(file);

        List<int[]> rows = new ArrayList<>();
        while (scan.hasNextLine()) {
            String line = scan.nextLine().trim();
            if (line.isEmpty()) continue;
            String[] tokens = line.split("\\s+");
            int[] row = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {
                if (tokens[i].equals(".")) {
                    row[i] = 0;
                } else {
                    try {
                        row[i] = Integer.parseInt(tokens[i]);
                    } catch (NumberFormatException e) {
                        scan.close();
                        throw new IllegalArgumentException("Invalid cell token: " + tokens[i]);
                    }
                }
            }
            rows.add(row);
        }
        scan.close();

        int n = rows.size();
        if (n == 0)
            throw new IllegalArgumentException("The board file is empty");

        // Check if square
        int kk = (int) Math.round(Math.sqrt(n));
        if (kk * kk != n)
            throw new IllegalArgumentException("The board size is not a perfect square");

        // Check rows for the correct # of entries
        for (int r = 0; r < n; r++) {
            if (rows.get(r).length != n)
                throw new IllegalArgumentException("Row " + r + " does not have the correct # of cells expected");
        }

        // Get the values of the board and check their range
        int[][] b = new int[n][n];
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) {
                int v = rows.get(r)[c];
                if (v < 0 || v > n)
                    throw new IllegalArgumentException("Cell (" + r + "," + c + ") value " + v + " is outside the range");
                b[r][c] = v;
            }
        }
        ensureNoConflict(b, n, kk);

        this.N = n;
        this.k = kk;
        this.board = b;
        this.turn = true;
        this.neighbors = buildNeighbors(n, kk);
    }

    // Used when creating the next state after a move
    private State(int[][] board, int N, int k, boolean maxTurn, int[][] neighbors) {
        this.board = board;
        this.N = N;
        this.k = k;
        this.turn = maxTurn;
        this.neighbors = neighbors;
    }

    // Checks if the board is completely filled
    public boolean isGoal() {
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++)
                if (board[r][c] == 0) return false;
        return true;
    }

    // State is terminal if the board is solved or no legal AC-3 moves remain
    public boolean isTerminal() {
        return isGoal() || getLegalMoves().isEmpty();
    }

    // Returns the outcome value for a terminal state
    public int utility() {
        if (!isTerminal())
            throw new IllegalStateException("The utility method was called on a non-terminal state");
        return isGoal() ? 1 : 0;
    }

    // Returns the next state produced by applying a move
    public State successorState(Move m) throws IllegalArgumentException {
        if (m == null)
            throw new IllegalArgumentException("Move is null");
        if (m.row < 0 || m.row >= N || m.col < 0 || m.col >= N)
            throw new IllegalArgumentException("Cell (" + m.row + "," + m.col + ") is out of bounds");
        if (board[m.row][m.col] != 0)
            throw new IllegalArgumentException("Cell (" + m.row + "," + m.col + ") is already filled");
        if (m.value < 1 || m.value > N)
            throw new IllegalArgumentException("Value " + m.value + " is outside [1," + N + "]");
        if (!isLocallyLegal(m.row, m.col, m.value))
            throw new IllegalArgumentException("Move " + m + " violates the constraints");

        int[][] newBoard = copyBoard();
        newBoard[m.row][m.col] = m.value;
        return new State(newBoard, N, k, !turn, neighbors);
    }

    // Generates the moves that do not break the row, column, or subgrid rules
    public List<Move> getLocallyLegalMoves() {
        List<Move> moves = new ArrayList<>();
        for (int r = 0; r < N; r++) {
            for (int c = 0; c < N; c++) {
                if (board[r][c] != 0) continue;
                for (int v = 1; v <= N; v++) {
                    if (isLocallyLegal(r, c, v))
                        moves.add(new Move(r, c, v));
                }
            }
        }
        return moves;
    }

    // Keeps only the moves that still leave the board AC-3 consistent
    public List<Move> getLegalMoves() {
        List<Move> legal = new ArrayList<>();
        for (Move m : getLocallyLegalMoves()) {
            int[][] newBoard = copyBoard();
            newBoard[m.row][m.col] = m.value;
            if (isAC3Consistent(newBoard))
                legal.add(m);
        }
        return legal;
    }

    // Checks whether putting v at (r, c) breaks any Sudoku rule
    private boolean isLocallyLegal(int r, int c, int v) {
        // Check the row
        for (int cc = 0; cc < N; cc++)
            if (board[r][cc] == v) return false;
        // Check the column
        for (int rr = 0; rr < N; rr++)
            if (board[rr][c] == v) return false;
        // Check the subgrid
        int topRow = (r / k) * k;
        int leftCol = (c / k) * k;
        for (int dr = 0; dr < k; dr++)
            for (int dc = 0; dc < k; dc++)
                if (board[topRow + dr][leftCol + dc] == v) return false;
        return true;
    }

    // Runs an AC-3 check on the board after a move
    // If any cell loses all possible values, the board is inconsistent
    private boolean isAC3Consistent(int[][] b) {
        Set<Integer>[] domain = new Set[N * N];

        for (int r = 0; r < N; r++) {
            for (int c = 0; c < N; c++) {
                int idx = r * N + c;
                if (b[r][c] != 0) {
                    domain[idx] = new HashSet<>();
                    domain[idx].add(b[r][c]);
                } else {
                    domain[idx] = new HashSet<>();
                    for (int v = 1; v <= N; v++) domain[idx].add(v);
                    for (int ni : neighbors[idx]) {
                        int nr = ni / N, nc = ni % N;
                        if (b[nr][nc] != 0)
                            domain[idx].remove(b[nr][nc]);
                    }
                    if (domain[idx].isEmpty()) return false; // no values left for this cell
                }
            }
        }

        // Store each arc as {i, j}
        Deque<int[]> queue = new ArrayDeque<>();
        for (int r = 0; r < N; r++) {
            for (int c = 0; c < N; c++) {
                if (b[r][c] != 0) continue;
                int i = r * N + c;
                for (int ni : neighbors[i])
                    queue.add(new int[]{i, ni});
            }
        }

        // Keep pruning while there is still work in the queue
        while (!queue.isEmpty()) {
            int[] arc = queue.poll();
            int i = arc[0];
            int j = arc[1];

            if (b[i / N][i % N] != 0) continue;

            if (domain[j].size() != 1) continue;

            int v = domain[j].iterator().next();

            if (domain[i].remove(v)) {
                if (domain[i].isEmpty()) return false; // domain got wiped out
                for (int ni : neighbors[i]) {
                    if (ni != j)
                        queue.add(new int[]{ni, i});
                }
            }
        }
        return true;
    }

    // Throws an exception if the starting board already violates Sudoku rules
    private static void ensureNoConflict(int[][] b, int n, int k) {
        boolean[] seen = new boolean[n + 1];

        // Check rows
        for (int r = 0; r < n; r++) {
            Arrays.fill(seen, false);
            for (int c = 0; c < n; c++) {
                int v = b[r][c];
                if (v == 0) continue;
                if (seen[v])
                    throw new IllegalArgumentException("Duplicate " + v + " in row " + r);
                seen[v] = true;
            }
        }

        // Check columns
        for (int c = 0; c < n; c++) {
            Arrays.fill(seen, false);
            for (int r = 0; r < n; r++) {
                int v = b[r][c];
                if (v == 0) continue;
                if (seen[v])
                    throw new IllegalArgumentException("Duplicate " + v + " in column " + c);
                seen[v] = true;
            }
        }

        // Check subgrids
        for (int topRow = 0; topRow < n; topRow += k) {
            for (int leftCol = 0; leftCol < n; leftCol += k) {
                Arrays.fill(seen, false);
                for (int dr = 0; dr < k; dr++) {
                    for (int dc = 0; dc < k; dc++) {
                        int v = b[topRow + dr][leftCol + dc];
                        if (v == 0) continue;
                        if (seen[v])
                            throw new IllegalArgumentException("Duplicate values in the subgrid");
                        seen[v] = true;
                    }
                }
            }
        }
    }

    // Precomputes the neighboring cells for each position
    private static int[][] buildNeighbors(int n, int k) {
        int[][] nb = new int[n * n][];
        boolean[] added = new boolean[n * n];

        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) {
                int idx = r * n + c;
                List<Integer> list = new ArrayList<>();
                Arrays.fill(added, false);
                added[idx] = true;

                // Same row
                for (int cc = 0; cc < n; cc++) {
                    int ni = r * n + cc;
                    if (!added[ni]) { added[ni] = true; list.add(ni); }
                }
                // Same column
                for (int rr = 0; rr < n; rr++) {
                    int ni = rr * n + c;
                    if (!added[ni]) { added[ni] = true; list.add(ni); }
                }
                // Same subgrid
                int topRow  = (r / k) * k;
                int leftCol = (c / k) * k;
                for (int dr = 0; dr < k; dr++) {
                    for (int dc = 0; dc < k; dc++) {
                        int ni = (topRow + dr) * n + (leftCol + dc);
                        if (!added[ni]) { added[ni] = true; list.add(ni); }
                    }
                }
                nb[idx] = new int[list.size()];
                for (int i = 0; i < list.size(); i++) nb[idx][i] = list.get(i);
            }
        }
        return nb;
    }

    // Makes a deep copy of the board
    private int[][] copyBoard() {
        int[][] copy = new int[N][N];
        for (int r = 0; r < N; r++)
            copy[r] = Arrays.copyOf(board[r], N);
        return copy;
    }
}