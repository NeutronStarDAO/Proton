import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Types "./types";

module {

  type Vertex = Types.Vertex;

  public class Digraph() {

    var vertexList: [Vertex] = [];
    var edgeList: [(Vertex, Vertex)] = []; // 单向边

    public func addVertex(vertex: Vertex) {
      vertexList := Array.append<Vertex>(vertexList, [vertex]);
    };

    // 添加 from 到 to 的单向边
    public func addEdge(fromVertex: Vertex, toVertex: Vertex) {
      // 检查是否已经存在
      assert(Array.find<(Vertex, Vertex)>(edgeList, func((x, y): (Vertex, Vertex)): Bool {
        x == fromVertex and y == toVertex
      }) == null);
      edgeList := Array.append<(Vertex, Vertex)>(edgeList, [(fromVertex, toVertex)]);
    };

    // 获取正向领边的节点 即得到某人的关注列表
    public func getForwardAdjacent(vertex: Vertex): [Vertex] {
      var adjacencyList: [Vertex] = [];
      for ((fromVertex, toVertex) in Iter.fromArray<(Vertex, Vertex)>(edgeList)) {
        if (fromVertex == vertex) {
          adjacencyList := Array.append<Vertex>(adjacencyList, [toVertex]);
        };
      };
      adjacencyList
    };
    
    // 获取反向领边的节点 即得到某人的粉丝列表
    public func getReverseAdjacent(vertex: Vertex): [Vertex] {
      var adjacencyList: [Vertex] = [];
      for ((fromVertex, toVertex) in Iter.fromArray<(Vertex, Vertex)>(edgeList)) {
        if (toVertex == vertex) {
          adjacencyList := Array.append<Vertex>(adjacencyList, [fromVertex]);
        };
      };
      adjacencyList
    };

  };
  
};
