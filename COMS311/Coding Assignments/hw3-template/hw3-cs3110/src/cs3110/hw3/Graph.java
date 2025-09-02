package cs3110.hw3;

import java.util.*;


public class Graph<T> {

    private Map<T, Set<T>> vertices = new HashMap<>();

    /* This class must have a default constructor. */
    public Graph() {
        vertices = new HashMap<>();
    }

    /**
     * Adds a vertex to the graph.
     *
     * @param u
     * @return False if vertex u was already in the graph, True otherwise.
     */
    public boolean addVertex(T u) {
        if (!vertices.containsKey(u)) {
            vertices.put(u, new HashSet<>());
            return true;
        }
        return false;
    }

    /**
     * Adds edge (u,v) to the graph.
     *
     * @param u
     * @param v
     * @return Returns false if the edge was already present, true otherwise.
     */
    public boolean addEdge(T u, T v) {
        if (vertices.containsKey(u) && vertices.containsKey(v)) {
            if (!vertices.get(u).contains(v)) {
                vertices.get(u).add(v);
                return true;
            }
        }
        return false;
    }

    /**
     * @return |V|
     */
    public int getVertexCount() {
        return vertices.size();
    }

    /**
     * @param v
     * @return True if vertex v is present in the graph, false otherwise.
     */
    public boolean hasVertex(T v) {
        return vertices.containsKey(v);
    }

    /**
     * Provides access to every vertex in the graph.
     *
     * @return An object that iterates over V.
     */
    public Iterable<T> getVertices() {
        return vertices.keySet();
    }

    /**
     * @return |E|
     */
    public int getEdgeCount() {
        int count = 0;
        for (T u : vertices.keySet()) {
            count += vertices.get(u).size();
        }
        return count;
    }

    /**
     * @param u One endpoint of the edge.
     * @param v The other endpoint of the edge.
     * @return True if edge (u,v) is present in the graph, false otherwise.
     */
    public boolean hasEdge(T u, T v) {
        if (vertices.containsKey(u) && vertices.containsKey(v)) {
            return vertices.get(u).contains(v);
        }
        return false;
    }

    /**
     * Returns all neighbors of vertex u.
     *
     * @param u A vertex.
     * @return The neighbors of u.
     */
    public Iterable<T> getNeighbors(T u) {
        return vertices.getOrDefault(u, Collections.emptySet());
    }

    /**
     * @param u
     * @param v
     * @return True if v is a neighbor of u.
     */
    public boolean isNeighbor(T u, T v) {
        if (vertices.containsKey(u) && vertices.containsKey(v)) {
            return vertices.get(u).contains(v);
        }
        return false;
    }


    /**
     * Finds the length of the shortest path from vertex s to all other vertices in the graph.
     *
     * @param s The source vertex.
     * @return A map of shortest path distances. Every reachable vertex v should be present as a key mapped to the length of the shortest s->v path.
     */
    public Map<T, Long> getShortestPaths(T s) {
        // This is just in case s is not in the graph
        if (!vertices.containsKey(s)) {
            return new HashMap<>();
        }

        Set<T> explored = new HashSet<>();
        HashMap<T, Long> layers = new HashMap<>();
        explored.add(s);
        layers.put(s, 0L);
        Queue<T> queue = new LinkedList<>();
        queue.add(s);

        while (!queue.isEmpty()) {
            T u = queue.poll();
            for (T v : vertices.get(u)) {
                if (!explored.contains(v)) {
                    queue.add(v);
                    layers.put(v, layers.get(u) + 1);
                    explored.add(v);
                }
            }
        }
        return layers;
    }

    /**
     *
     * @param start
     * @param end
     */
    public void removeEdge(T start, T end) {
        Set<T> neighbors = vertices.get(start);
        if (neighbors != null) {
            neighbors.remove(end);
        }
    }

}
