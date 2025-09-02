package cs3110.hw3;

import java.util.*;

public class NetworkAnalyzer {
    private Graph<String> graph = new Graph();
    private List<String> hostNames;

    public NetworkAnalyzer(List<String> hosts, Map<String, String> simplexConnections, Map<String, String> duplexConnections) {
        hostNames = hosts;

        for (String host : hostNames) {
            graph.addVertex(host);
        }
        for (String host : simplexConnections.keySet()) {
            graph.addEdge(host, simplexConnections.get(host));
        }
        for (String host : duplexConnections.keySet()) {
            graph.addEdge(host, duplexConnections.get(host));
            graph.addEdge(duplexConnections.get(host), host);
        }
    }

    /**
     * The method below finds the maximum time needed to get a message
     * from one computer to another.
     *
     * @return Max Time required for any message to be delivered to another computer
     */
    public long findMaxDeliveryTime() {
        long maxTime = -1;

        for (String startNode : hostNames) {
            Map<String, Long> shortestPaths = graph.getShortestPaths(startNode);
            for (String endNode : shortestPaths.keySet()) {
                if (!startNode.equals(endNode)) {
                    maxTime = Math.max(maxTime, shortestPaths.get(endNode));
                }
            }
        }
        return maxTime;
    }

    //https://www.geeksforgeeks.org/dsa/depth-first-search-or-dfs-for-a-graph/
    // Used the above website as a reference for the extra credit

    /**
     * The method below uses DFS to return the min number of duplex connections
     * required to reconnect a graph after removing the given simplex connections.
     *
     * @param simplexConnectionsToRemove
     * @return Minimum number of duplex connections needed to reconnect graph after
     * removing the given simplex connections.
     */
    public int countMinToReconnect(Map<String, String> simplexConnectionsToRemove) {
        // Remove the simplex connections (edges)
        for (Map.Entry<String, String> edge : simplexConnectionsToRemove.entrySet()) {
            graph.removeEdge(edge.getKey(), edge.getValue());
        }
        // Find SCCs
        Set<String> visited = new HashSet<>();
        Deque<String> stack = new ArrayDeque<>();
        for (String node : hostNames) {
            if (!visited.contains(node)) {
                dfsFillStack(node, visited, stack);
            }
        }

        // Reverse the graph
        Graph<String> reversed = new Graph();
        for (String node : hostNames) {
            reversed.addVertex(node);
        }
        for (String u : hostNames) {
            for (String neighbor : graph.getNeighbors(u)) {
                String v = neighbor;
                reversed.addEdge(v, u);
            }
        }

        // Now we DFS on the reversed graph
        visited.clear();
        int SCCs = 0;
        while (!stack.isEmpty()) {
            String node = stack.pop();
            if (!visited.contains(node)) {
                dfsRecursive(reversed, node, visited);
                SCCs++;
            }
        }
        // Return SCC's - 1
        return SCCs - 1;
    }

    /**
     * This method is a helper to the DFS method above
     * and helps to fill out the stack in post-order.
     *
     * @param curr
     * @param visited
     * @param stack
     */
    private void dfsFillStack(String curr, Set<String> visited, Deque<String> stack) {
        visited.add(curr);

        for (String neighborCurr : graph.getNeighbors(curr)) {
            String neighbor = neighborCurr;
            if (!visited.contains(neighbor)) {
                dfsFillStack(neighbor, visited, stack);
            }
        }
        stack.push(curr); // push onto stack after done exploring all neighbors
    }

    /**
     * This is the recursive method called
     * in the countMinToReconnect method above.
     *
     * @param g
     * @param curr
     * @param visited
     */
    private void dfsRecursive(Graph<String> g, String curr, Set<String> visited) {
        visited.add(curr);

        for (String neighborCurr : g.getNeighbors(curr)) {
            String neighbor = neighborCurr;
            if (!visited.contains(neighbor)) {
                dfsRecursive(g, neighbor, visited);
            }
        }
    }
}
