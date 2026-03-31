Questions asked to AI (Perplexity) and the response:

Q: Can you refresh me on how to implement a priority queue in java?
Snippet of Response:

Using Comparator

java
import java.util.Comparator;
import java.util.PriorityQueue;

class Node {
    int cost;
    String name;
    Node(String name, int cost) {
        this.name = name;
        this.cost = cost;
    }
}

PriorityQueue<Node> open =
        new PriorityQueue<>(Comparator.comparingInt(n -> n.cost));

open.add(new Node("A", 10));
open.add(new Node("B", 5));
open.add(new Node("C", 7));
Here the smallest cost has highest priority.

I also used Perplexity to remind me of some other things such as:
- How to override equals.
- Why does hashCode need overriding if I already did equals?
- Teach me how to use illegalArgumentException with and without variables.
- What are all the calls I can use when using a priority queue? (This was for using poll(), I forgot the name for it.)