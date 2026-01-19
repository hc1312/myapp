// pathfinder.js
import { ALL_STATIONS_MAP, LINES } from './subwayData';

// 构建图结构 (邻接表)
const buildGraph = () => {
  const graph = {};
  
  // 初始化节点
  Object.keys(ALL_STATIONS_MAP).forEach(id => {
    graph[id] = [];
  });

  LINES.forEach(line => {
    for (let i = 0; i < line.stations.length; i++) {
      const currId = line.stations[i].id;
      
      // 1. 连接前后站点
      if (i > 0) {
        graph[currId].push(line.stations[i - 1].id);
      }
      if (i < line.stations.length - 1) {
        graph[currId].push(line.stations[i + 1].id);
      }

      // 2. 连接换乘站点
      const station = line.stations[i];
      if (station.transferTo && station.transferTargetId) {
        graph[currId].push(station.transferTargetId);
      }
    }
  });
  return graph;
};

const graph = buildGraph();

// BFS 寻路算法
export const findPath = (startId, endId) => {
  if (!startId || !endId) return [];
  if (startId === endId) return [];

  const queue = [startId];
  const visited = new Set([startId]);
  const predecessors = {}; // 记录路径来源: { 'target': 'source' }

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === endId) {
      // 找到终点，回溯路径
      const path = [];
      let step = endId;
      while (step) {
        path.unshift(step);
        step = predecessors[step];
      }
      return processRoute(path);
    }

    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        predecessors[neighbor] = current;
        queue.push(neighbor);
      }
    }
  }
  return []; // 无路径
};

// 将纯ID路径转换为人类可读的步骤
const processRoute = (idPath) => {
  const steps = [];
  
  if (idPath.length < 2) return steps;

  // 起点
  let currentLine = ALL_STATIONS_MAP[idPath[0]].lineId;
  let segmentStart = idPath[0];

  for (let i = 1; i < idPath.length; i++) {
    const prevId = idPath[i - 1];
    const currId = idPath[i];
    const prevStation = ALL_STATIONS_MAP[prevId];
    const currStation = ALL_STATIONS_MAP[currId];

    // 检测是否发生了线路变更 (即换乘)
    // 注意：如果是同一线路内移动，LineId相同。如果是换乘连接，LineId不同。
    if (prevStation.lineId !== currStation.lineId) {
      // 1. 结算上一段行程
      steps.push({
        type: 'RIDE',
        lineName: LINES.find(l => l.id === prevStation.lineId).name,
        from: ALL_STATIONS_MAP[segmentStart].name,
        to: prevStation.name
      });

      // 2. 添加换乘动作
      steps.push({
        type: 'TRANSFER',
        at: prevStation.name,
        toLine: LINES.find(l => l.id === currStation.lineId).name
      });

      // 重置下一段的起点
      segmentStart = currId;
      currentLine = currStation.lineId;
    }
  }

  // 结算最后一段行程
  const lastId = idPath[idPath.length - 1];
  if (segmentStart !== lastId) {
    steps.push({
      type: 'RIDE',
      lineName: LINES.find(l => l.id === currentLine).name,
      from: ALL_STATIONS_MAP[segmentStart].name,
      to: ALL_STATIONS_MAP[lastId].name
    });
  }

  // 添加终点到达
  steps.push({
    type: 'ARRIVE',
    at: ALL_STATIONS_MAP[lastId].name
  });

  return steps;
};