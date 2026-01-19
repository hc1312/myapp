// SubwaySimulation.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layout, Card, Select, Button, Steps, Row, Col, Tag, Typography, Divider } from 'antd';
import { SearchOutlined, SwapRightOutlined } from '@ant-design/icons';
import { LINES, INITIAL_TRAINS, ALL_STATIONS_MAP } from './subwayData';
import { findPath } from './pathfinder';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Step } = Steps;
const { Title, Text } = Typography;

// --- 辅助函数：获取路径涉及的车站 ID 和轨道段信息 ---
const getPathStationIds = (steps) => {
    if (!steps || steps.length === 0) return { stationIds: new Set(), segmentMap: new Map() };

    const stationIds = new Set();
    // Map<LineId, Set<SegmentKey>> SegmentKey: "S01-S02" (总是从小到大索引)
    const segmentMap = new Map(); 

    steps.forEach(step => {
        if (step.type === 'RIDE') {
            const line = LINES.find(l => l.name === step.lineName);
            if (!line) return;

            // 注意：这里需要通过 name 找到对应的 ID，因为 ALL_STATIONS_MAP 是用 ID 索引的
            const fromId = Object.keys(ALL_STATIONS_MAP).find(key => ALL_STATIONS_MAP[key].name === step.from);
            const toId = Object.keys(ALL_STATIONS_MAP).find(key => ALL_STATIONS_MAP[key].name === step.to);
            
            if (!fromId || !toId) return; // 确保找到了有效的站点ID

            stationIds.add(fromId);
            stationIds.add(toId);

            const stations = line.stations;
            const startIndex = stations.findIndex(s => s.id === fromId);
            const endIndex = stations.findIndex(s => s.id === toId);

            // **修复点：如果任一站点不在当前线路的 stations 数组中 (即 index 为 -1)，则跳过此段轨道高亮**
            if (startIndex === -1 || endIndex === -1) return;

            // 确定遍历方向和范围
            const start = Math.min(startIndex, endIndex);
            const end = Math.max(startIndex, endIndex);

            for (let i = start; i <= end; i++) {
                // stationIds.add(stations[i].id); // 已经在上面添加过 fromId 和 toId
                // 标记轨道段
                if (i < end) {
                    const segmentKey = `${stations[i].id}-${stations[i+1].id}`;
                    if (!segmentMap.has(line.id)) {
                        segmentMap.set(line.id, new Set());
                    }
                    segmentMap.get(line.id).add(segmentKey);
                }
            }
        } else if (step.type === 'TRANSFER' || step.type === 'ARRIVE') {
            const stationId = Object.keys(ALL_STATIONS_MAP).find(key => ALL_STATIONS_MAP[key].name === step.at);
            if (stationId) stationIds.add(stationId);
        }
    });

    return { stationIds, segmentMap };
};


const SubwaySimulation = () => {
  // --- 状态管理 ---
  const [trains, setTrains] = useState(INITIAL_TRAINS);
  // 使用 L1-S01 和 L4-S12 作为默认起点和终点
  const [startStation, setStartStation] = useState('L1-S01'); 
  const [endStation, setEndStation] = useState('L4-S12');
  const [routeSteps, setRouteSteps] = useState([]);
  
  // 计算路径高亮所需的数据
  const { stationIds: pathStations, segmentMap: pathSegments } = useMemo(() => getPathStationIds(routeSteps), [routeSteps]);

  // --- 动画循环逻辑 (加入调度) ---
  useEffect(() => {
    const tickRate = 50; // 刷新率 (ms)
    const speed = 0.02;  // 移动速度 (每tick移动的百分比)
    const STATION_WAIT_TICKS = 60; // 停留时间，约 3 秒 (60 * 50ms)

    const interval = setInterval(() => {
      setTrains(prevTrains => prevTrains.map(train => {
        let { currStationIdx, progress, direction, status, waitTimer } = train; // 引入状态和计时器
        const newLineLength = LINES.find(l => l.id === train.lineId).stations.length;

        if (status === 'AT_STATION') {
          // 1. 站点等待逻辑
          waitTimer += 1;
          if (waitTimer >= STATION_WAIT_TICKS) {
            status = 'MOVING';
            waitTimer = 0;
            
            // 在离开车站时，检查是否需要反转方向
            if (currStationIdx === newLineLength - 1) {
              direction = -1; // 到达终点，反转
            } else if (currStationIdx === 0) {
              direction = 1; // 到达起点，反转
            }
          }
        } else { // status === 'MOVING'
          // 2. 更新移动进度
          progress += speed;

          // 如果走完了一站的路程，则进站
          if (progress >= 1) {
            progress = 0;
            
            // 更新站点索引（到达下一站）
            const nextIdx = currStationIdx + direction;
            
            // 如果下一站是有效站，则进站等待
            if (nextIdx >= 0 && nextIdx < newLineLength) {
                currStationIdx = nextIdx;
                status = 'AT_STATION'; // 进入等待状态
                waitTimer = 0;
            } else {
                // 如果尝试超出边界，保持在当前边界站并进入等待状态
                status = 'AT_STATION';
                waitTimer = 0;
            }
          }
        }
        
        // 保证 currStationIdx 不超出界限
        currStationIdx = Math.max(0, Math.min(currStationIdx, newLineLength - 1));

        return { ...train, currStationIdx, progress, direction, status, waitTimer };
      }));
    }, tickRate);

    return () => clearInterval(interval);
  }, []);

  // --- 交互逻辑 ---
  const handleSearch = () => {
    const steps = findPath(startStation, endStation);
    setRouteSteps(steps);
  };

  // --- 渲染辅助函数 ---
  
  // 渲染单一线路
  const renderLine = (line) => {
    const segmentsToHighlight = pathSegments.get(line.id) || new Set();

    return (
      <div key={line.id} style={{ marginBottom: '40px', position: 'relative' }}>
        <Title level={5} style={{ color: line.color }}>{line.name}</Title>
        
        {/* 轨道线 (基础灰色) */}
        <div style={{ 
          height: '6px', 
          backgroundColor: '#ccc', // 默认轨道色改为灰色
          width: '100%', 
          position: 'absolute', 
          top: '50px', 
          zIndex: 1,
          borderRadius: '3px'
        }} />

        {/* 轨道线 (高亮部分) */}
        {line.stations.map((station, idx) => {
            if (idx >= line.stations.length - 1) return null; // 最后一个站没有后续轨道段
            
            const nextStation = line.stations[idx + 1];
            // 路径上的轨道段键值 (确保顺序一致性)
            const segmentKey = `${station.id}-${nextStation.id}`; 

            if (segmentsToHighlight.has(segmentKey)) { // 检查是否需要高亮
                // 假设12个站将宽度分为11段
                const segmentWidth = 100 / (line.stations.length - 1); 
                return (
                    <div 
                        key={`highlight-${segmentKey}`}
                        style={{
                            position: 'absolute',
                            left: `${(idx / (line.stations.length - 1)) * 100}%`,
                            width: `${segmentWidth}%`,
                            height: '6px',
                            backgroundColor: line.color, // 高亮色为线路颜色
                            top: '50px',
                            zIndex: 2, 
                        }}
                    />
                );
            }
            return null;
        })}

        {/* 车站容器 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3 }}>
          {line.stations.map((station, idx) => {
            
            // 车站圆点样式
            const isPathStation = pathStations.has(station.id); // 检查是否在路径中
            
            return (
              <div key={station.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%' }}>
                
                {/* 车站圆点 */}
                <div style={{ 
                  width: station.transferTo ? '18px' : '12px', 
                  height: station.transferTo ? '18px' : '12px', 
                  borderRadius: '50%', 
                  backgroundColor: isPathStation ? line.color : 'white', // 路径上的站内环是线路颜色
                  border: `3px solid ${isPathStation ? 'black' : (station.transferTo ? 'gold' : '#555')}`, // 路径上的站外环是黑色
                  marginBottom: '5px',
                  marginTop: station.transferTo ? '41px' : '44px', // 对齐轨道
                  cursor: 'pointer'
                }} 
                title={station.name}
                />
                
                {/* 车站名称 - 优化以适应中文站名 */}
                <Text style={{ 
                    fontSize: '10px', 
                    textAlign: 'center', 
                    whiteSpace: 'normal', 
                    lineHeight: '1.2',
                    height: '24px', // 预留两行空间
                    overflow: 'hidden'
                }}>{station.name}</Text>

                {station.transferTo && <Tag color="gold" style={{fontSize: '9px', margin: 0, padding: '0 2px'}}>换 {station.transferTo}</Tag>}
              </div>
            );
          })}
        </div>

        {/* 渲染该线路上的列车 */}
        {trains.filter(t => t.lineId === line.id).map(train => {
          // 计算列车的 left 百分比位置
          const segmentCount = line.stations.length - 1;
          
          let visualIndex;
          if (train.status === 'AT_STATION') {
            // 在站等待时，位置固定在当前车站索引上
            visualIndex = train.currStationIdx;
          } else {
            // 移动时，使用进度
            visualIndex = train.currStationIdx + (train.direction * train.progress);
          }
          
          // 将索引转换为百分比
          let visualPercent = visualIndex * (100 / segmentCount);

          // 状态指示
          const trainColor = train.status === 'AT_STATION' ? 'red' : 'black';
          const trainSymbol = train.direction > 0 ? '→' : '←';

          return (
            <div
              key={train.id}
              style={{
                position: 'absolute',
                left: `calc(${visualPercent}% - 6px)`, // -6px 是为了居中 (宽度的一半)
                top: '44px',
                width: '16px',
                height: '16px',
                backgroundColor: trainColor, // 状态高亮
                border: `2px solid white`,
                borderRadius: '3px',
                zIndex: 10,
                transition: 'left 50ms linear', // 保持与 tickRate 一致以获得流畅动画
                boxShadow: '0 0 4px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{fontSize: '8px', color: 'white', textAlign: 'center', lineHeight: '12px'}}>
                 {trainSymbol}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>🚇 城市地铁模拟系统</div>
      </Header>
      
      <Layout>
        {/* 左侧控制面板 */}
        <Sider width={350} theme="light" style={{ padding: '20px', borderRight: '1px solid #f0f0f0' }}>
          <Title level={4}>路线规划</Title>
          
          <div style={{ marginBottom: 15 }}>
            <Text>起点站:</Text>
            <Select 
              showSearch
              style={{ width: '100%' }} 
              value={startStation}
              onChange={setStartStation}
              optionFilterProp="children"
            >
              {LINES.map(line => (
                <Select.OptGroup key={line.id} label={line.name}>
                  {line.stations.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                </Select.OptGroup>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text>终点站:</Text>
            <Select 
              showSearch
              style={{ width: '100%' }} 
              value={endStation}
              onChange={setEndStation}
              optionFilterProp="children"
            >
              {LINES.map(line => (
                <Select.OptGroup key={line.id} label={line.name}>
                  {line.stations.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                </Select.OptGroup>
              ))}
            </Select>
          </div>

          <Button type="primary" icon={<SearchOutlined />} block onClick={handleSearch} size="large">
            开始导航
          </Button>

          <Divider />

          {routeSteps.length > 0 && (
            <Card title="导航结果" size="small" style={{ backgroundColor: '#f9f9f9' }}>
              <Steps direction="vertical" size="small" current={routeSteps.length - 1}>
                {routeSteps.map((step, idx) => {
                  let icon = null;
                  let title = '';
                  let desc = '';

                  if (step.type === 'RIDE') {
                    title = `乘坐 ${step.lineName}`;
                    desc = `${step.from}  →  ${step.to}`;
                    icon = <SwapRightOutlined />;
                  } else if (step.type === 'TRANSFER') {
                    title = '站内换乘';
                    desc = `在 ${step.at} 换乘 ${step.toLine}`;
                  } else if (step.type === 'ARRIVE') {
                    title = '到达目的地';
                    desc = step.at;
                  }

                  return <Step key={idx} title={title} description={desc} icon={icon} />;
                })}
              </Steps>
            </Card>
          )}
        </Sider>

        {/* 右侧地图区域 */}
        <Content style={{ padding: '24px', overflowY: 'auto' }}>
          <Card title="实时运行监控" bordered={false}>
            {LINES.map(line => renderLine(line))}
          </Card>
          
          <div style={{ marginTop: 20, padding: 10, background: '#fff', borderRadius: 4 }}>
            <Title level={5}>图例说明</Title>
            <Row gutter={16}>
              <Col><Tag color="default">⚪ 普通站</Tag></Col>
              <Col><Tag color="gold">🟡 换乘站</Tag></Col>
              <Col><div style={{display:'inline-block', width:12, height:12, background:'black', borderRadius:2, verticalAlign:'middle'}}></div> <Text>列车运行中</Text></Col>
              <Col><div style={{display:'inline-block', width:12, height:12, background:'red', borderRadius:2, verticalAlign:'middle'}}></div> <Text>列车在站等待</Text></Col>
              <Col><Tag color="green">✅ 路径高亮</Tag></Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SubwaySimulation;