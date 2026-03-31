import java.util.*;
import java.io.*;

// Need to make sure it is immutable
public class State {

    public static Heuristic heuristic;

    private final int n;
    private final int robotRow, robotCol;
    private final boolean[][] posts;
    private final boolean[][] storageLocation;
    private final boolean[][] crates;
    private final int g;

    // Constructor for initial state from file
    public State(String inputFileName) throws FileNotFoundException, IllegalArgumentException {
        List<String> lines = new ArrayList<>();
        Scanner sc = new Scanner(new File(inputFileName));
        while (sc.hasNextLine()) lines.add(sc.nextLine());
        sc.close();

        int rows = lines.size();
        if (rows == 0) throw new IllegalArgumentException("The file is empty");
        int cols = lines.get(0).length();
        if (rows != cols) throw new IllegalArgumentException("The grid needs to be N x N");

        this.n = rows;
        this.posts = new boolean[n][n];
        this.storageLocation = new boolean[n][n];
        this.crates = new boolean[n][n];

        int startRow = -1, startCol = -1;
        int numCrate = 0, numStorage = 0;

        for (int r = 0; r < n; r++) {
            String line = lines.get(r);
            if (line.length() != n) throw new IllegalArgumentException("The rows length is not the same");
            for (int c = 0; c < n; c++) {
                char ch = line.charAt(c);
                switch (ch) {
                    case 'R':
                        if (startRow != -1) throw new IllegalArgumentException("More than one robot exists");
                        startRow = r; startCol = c;
                        break;
                    case 'C': crates[r][c] = true; numCrate++; break;
                    case 'P': posts[r][c] = true; break;
                    case 'S': storageLocation[r][c] = true; numStorage++; break;
                    case '.': break;
                    default: throw new IllegalArgumentException("Invalid char: " + ch);
                }
            }
        }
        if (startRow == -1) throw new IllegalArgumentException("Robot not found");
        if (numCrate > numStorage) throw new IllegalArgumentException("# of Crates > # of Storage Locations");

        this.robotRow = startRow;
        this.robotCol = startCol;
        this.g = 0;
    }

    // Private constructor for successor states
    private State(int n, int robotRow, int robotCol, boolean[][] posts, boolean[][] storageLocation, boolean[][] crates, int g) {
        this.n = n;
        this.robotRow = robotRow;
        this.robotCol = robotCol;
        this.posts = posts;
        this.storageLocation = storageLocation;
        this.crates = crates;
        this.g = g;
    }

    public int getG() { 
        return g; 
    }

    public boolean isGoal() {
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                if (crates[r][c] && !storageLocation[r][c]) return false;
        return true;
    }

    public State successorState(Move m) throws IllegalArgumentException {
        int deltaRow = 0, deltaCol = 0;
        switch (m) {
            case UP:    deltaRow = -1; break;
            case DOWN:  deltaRow =  1; break;
            case LEFT:  deltaCol = -1; break;
            case RIGHT: deltaCol =  1; break;
        }

        int destRow = robotRow + deltaRow;
        int destCol = robotCol + deltaCol;

        if (!inBounds(destRow, destCol)) throw new IllegalArgumentException("Not in bound");
        if (posts[destRow][destCol]) throw new IllegalArgumentException("There is a post at the destination");

        boolean[][] newCrates = copyCrates();

        if (crates[destRow][destCol]) {
            int pushRow = destRow + deltaRow;
            int pushCol = destCol + deltaCol;
            if (!inBounds(pushRow, pushCol)) throw new IllegalArgumentException("Push the cell out of bounds");
            if (posts[pushRow][pushCol] || crates[pushRow][pushCol]) throw new IllegalArgumentException("Unable to push the crate");
            newCrates[destRow][destCol] = false;
            newCrates[pushRow][pushCol] = true;
        }

        return new State(n, destRow, destCol, posts, storageLocation, newCrates, g + 1);
    }

    public int cost() {
        return g + h();
    }

    private int h() {
        if (heuristic == Heuristic.H1) return h1();
        return h2();
    }

    // This uses the sum of the Manhattan Distance from:
    // Crate -> Nearest Storage Location
    private int h1() {
        int total = 0;
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) {
                if (!crates[r][c]) continue;
                int best = Integer.MAX_VALUE;
                for (int sr = 0; sr < n; sr++)
                    for (int sc = 0; sc < n; sc++)
                        if (storageLocation[sr][sc])
                            best = Math.min(best, Math.abs(r - sr) + Math.abs(c - sc));
                total += best;
            }
        }
        return total;
    }

    // This uses the sum of the Manhattan Distance from:
    // (Robot -> Crate) + (Crate -> Nearest Storage Location)
    private int h2() {
        int total = 0;
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) {
                if (!crates[r][c]) continue;
                int robotToCrate = Math.abs(robotRow - r) + Math.abs(robotCol - c);
                int best = Integer.MAX_VALUE;
                for (int sr = 0; sr < n; sr++)
                    for (int sc = 0; sc < n; sc++)
                        if (storageLocation[sr][sc])
                            best = Math.min(best, Math.abs(r - sr) + Math.abs(c - sc));
                total += robotToCrate + best;
            }
        }
        return total;
    }

    private boolean inBounds(int r, int c) {
        return r >= 0 && r < n && c >= 0 && c < n;
    }

    private boolean[][] copyCrates() {
        boolean[][] copy = new boolean[n][n];
        for (int r = 0; r < n; r++) copy[r] = Arrays.copyOf(crates[r], n);
        return copy;
    }

    // Below @Override's are needed for the visited map in WarehouseRobot.java, otherwise search will re-expand visited nodes
    // State Identity is basically the robot's position + crate's position
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof State)) return false;
        State o = (State) obj;
        if (robotRow != o.robotRow || robotCol != o.robotCol) return false;
        for (int r = 0; r < n; r++)
            if (!Arrays.equals(crates[r], o.crates[r])) return false;
        return true;
    }

    // Needed to Override this too since HashMap uses hashCode
    @Override
    public int hashCode() {
        int hash = robotRow * 31 + robotCol;
        for (int r = 0; r < n; r++)
            hash = hash * 31 + Arrays.hashCode(crates[r]);
        return hash;
    }
}