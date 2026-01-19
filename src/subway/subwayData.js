// subwayData.js

// 车站名称数据 (12个站名 - 中文译名)
const L1_STATION_NAMES = [
  "伊灵大道", "西鲁斯利普", "诺索尔特", "芬斯伯里公园", 
  "南鲁斯利普", "萨德伯里山", "格林福德", "佩里韦尔", 
  "北艾克顿", "滑铁卢", "贝思纳尔绿地", "利物浦街"
];
const L2_STATION_NAMES = [
  "考克福斯特斯", "奥克伍德", "南门", "芬斯伯里公园", 
  "庄园之家", "特恩派克巷", "伍德格林", "威斯敏斯特", 
  "邦兹格林", "伯爵阁", "科芬园", "海德公园角"
];
const L3_STATION_NAMES = [
  "里士满", "邱园", "冈纳斯伯里", "艾克顿镇", 
  "国王十字圣潘克拉斯", "斯坦福布鲁克", "拉文斯考特公园", "威斯敏斯特", 
  "堤岸", "圣殿", "黑衣修士", "塔山"
];
const L4_STATION_NAMES = [
  "奥德盖特", "摩尔门", "巴比肯", "法灵顿", 
  "国王十字圣潘克拉斯", "尤斯顿广场", "贝克街", "芬奇利路", 
  "温布利公园", "滑铁卢", "南哈罗", "乌克斯桥"
];

// 辅助函数：生成车站
const createStations = (lineId, lineName, stationNames) => {
  const stations = [];
  for (let i = 0; i < stationNames.length; i++) {
    // 车站 ID 从 S01 开始
    const id = `${lineId}-S${String(i + 1).padStart(2, '0')}`;
    stations.push({
      id: id,
      name: stationNames[i], // 使用中文站名
      lineId: lineId,
      transferTo: null, // 如果是换乘站，将存储目标线路ID
    });
  }
  return stations;
};

// 定义线路
export const LINES = [
  { id: 'L1', name: 'L1 中央线', color: '#ff4d4f', stationNames: L1_STATION_NAMES },
  { id: 'L2', name: 'L2 皮卡迪利线', color: '#1890ff', stationNames: L2_STATION_NAMES },
  { id: 'L3', name: 'L3 区线', color: '#52c41a', stationNames: L3_STATION_NAMES },
  { id: 'L4', name: 'L4 大都会线', color: '#722ed1', stationNames: L4_STATION_NAMES },
];

// 初始化车站数据
LINES.forEach(line => {
  line.stations = createStations(line.id, line.name, line.stationNames);
});

// 配置4个换乘站 (双向绑定)
// 逻辑：L1(S04) <-> L2(S04), L2(S08) <-> L3(S08), L3(S05) <-> L4(S05), L4(S10) <-> L1(S10)
// 数组索引是从 0 开始，所以 S04 对应 index 3
// S08 -> index 7, S05 -> index 4, S10 -> index 9

// 1. L1(index 3: 西艾克顿) <-> L2(index 3: 芬斯伯里公园)
LINES[0].stations[3].transferTo = 'L2';
LINES[0].stations[3].transferTargetId = LINES[1].stations[3].id;
LINES[1].stations[3].transferTo = 'L1';
LINES[1].stations[3].transferTargetId = LINES[0].stations[3].id;

// 2. L2(index 7: 阿诺斯格罗夫) <-> L3(index 7: 威斯敏斯特)
LINES[1].stations[7].transferTo = 'L3';
LINES[1].stations[7].transferTargetId = LINES[2].stations[7].id;
LINES[2].stations[7].transferTo = 'L2';
LINES[2].stations[7].transferTargetId = LINES[1].stations[7].id;

// 3. L3(index 4: 特纳姆格林) <-> L4(index 4: 国王十字圣潘克拉斯)
LINES[2].stations[4].transferTo = 'L4';
LINES[2].stations[4].transferTargetId = LINES[3].stations[4].id;
LINES[3].stations[4].transferTo = 'L3';
LINES[3].stations[4].transferTargetId = LINES[2].stations[4].id;

// 4. L4(index 9: 滑铁卢) <-> L1(index 9: 银行)
LINES[3].stations[9].transferTo = 'L1';
LINES[3].stations[9].transferTargetId = LINES[0].stations[9].id;
LINES[0].stations[9].transferTo = 'L4';
LINES[0].stations[9].transferTargetId = LINES[3].stations[9].id;

// 初始化列车 (每条线3辆)
export const INITIAL_TRAINS = [];
LINES.forEach(line => {
  // 分别在第1站(index 0)、第5站(index 4)、第9站(index 8)放置列车
  [0, 4, 8].forEach((startIndex, idx) => {
    INITIAL_TRAINS.push({
      id: `${line.id}-T${idx + 1}`,
      lineId: line.id,
      currStationIdx: startIndex, // 当前站点索引 (0-11)
      progress: 0, // 0到1之间的小数，表示两站之间的进度
      direction: 1, // 1 为正向 (index增加), -1 为反向
      status: 'AT_STATION', // 新增：初始状态为在站等待
      waitTimer: 0,         // 新增：等待计时器
    });
  });
});

// 展平所有车站，方便查找
export const ALL_STATIONS_MAP = {};
LINES.forEach(line => {
  line.stations.forEach(s => {
    ALL_STATIONS_MAP[s.id] = s;
  });
});