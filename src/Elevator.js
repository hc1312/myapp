import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Col, Row, Tag, message, Statistic, Switch } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PoweroffOutlined, DingdingOutlined } from '@ant-design/icons';

// --- 常量配置 ---
const TOTAL_FLOORS = 15;
const FLOOR_HEIGHT = 40; // 每一层在UI上的像素高度
const MOVE_INTERVAL = 1000; // 电梯每层移动耗时 (ms)
const DOOR_TIME = 2000; // 开门/关门停留时间 (ms)

// --- 样式对象 ---
const styles = {
  container: { padding: '20px', background: '#f0f2f5', minHeight: '100vh' },
  shaft: {
    border: '2px solid #333',
    borderRadius: '4px',
    background: '#fff',
    position: 'relative',
    height: `${TOTAL_FLOORS * FLOOR_HEIGHT}px`,
    display: 'flex',
    flexDirection: 'column-reverse', // 让1楼在最下面
  },
  floor: {
    height: `${FLOOR_HEIGHT}px`,
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '12px',
    color: '#999',
    justifyContent: 'space-between',
  },
  elevatorCar: {
    position: 'absolute',
    left: '5px',
    right: '5px',
    height: `${FLOOR_HEIGHT - 4}px`,
    background: '#1890ff',
    borderRadius: '4px',
    transition: `bottom ${MOVE_INTERVAL}ms linear`, // CSS过渡动画实现平滑移动
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  doorOpen: {
    background: '#52c41a', // 开门时变绿
    width: '90%',
    left: '5%',
  },
  panelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
};

const ElevatorSimulation = () => {
  // --- State ---
  const [currentFloor, setCurrentFloor] = useState(1);
  const [direction, setDirection] = useState('idle'); // 'up', 'down', 'idle'
  const [requestsUp, setRequestsUp] = useState(new Set()); // 上行请求（含大厅上行呼叫与内部上行目标）
  const [requestsDown, setRequestsDown] = useState(new Set()); // 下行请求（含大厅下行呼叫与内部下行目标）
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [statusText, setStatusText] = useState('待机中');
  const [isInsideView, setIsInsideView] = useState(false); // 切换视角：内部/外部

  // 使用 Ref 处理定时器逻辑，避免闭包陷阱
  const stateRef = useRef({
    currentFloor,
    direction,
    requestsUp,
    requestsDown,
    isDoorOpen
  });

  // 同步 Ref
  useEffect(() => {
    stateRef.current = { currentFloor, direction, requestsUp, requestsDown, isDoorOpen };
  }, [currentFloor, direction, requestsUp, requestsDown, isDoorOpen]);

  // --- helpers ---
  const hasUpAbove = (floor, upSet) => Array.from(upSet).some(f => f > floor);
  const hasUpAtOrAbove = (floor, upSet) => Array.from(upSet).some(f => f >= floor);
  const hasDownBelow = (floor, downSet) => Array.from(downSet).some(f => f < floor);
  const hasDownAtOrBelow = (floor, downSet) => Array.from(downSet).some(f => f <= floor);
  const hasAnyRequests = (upSet, downSet) => upSet.size > 0 || downSet.size > 0;

  const removeArrivalRequest = (floor, dir) => {
    // 到站时只清除匹配当前方向的请求（模拟大厅方向呼叫 & 车内目标）
    if (dir === 'up' || dir === 'idle') {
      setRequestsUp(prev => {
        const next = new Set(prev);
        next.delete(floor);
        return next;
      });
    }
    if (dir === 'down' || dir === 'idle') {
      setRequestsDown(prev => {
        const next = new Set(prev);
        next.delete(floor);
        return next;
      });
    }
  };

  // --- 核心引擎 Loop ---
  useEffect(() => {
    let timer;

    const processElevator = () => {
      const { currentFloor, direction, requestsUp, requestsDown, isDoorOpen } = stateRef.current;

      // 1. 如果正在开门，等待开门逻辑自动关闭
      if (isDoorOpen) return;

      // 2. 没有请求则待机
      if (!hasAnyRequests(requestsUp, requestsDown)) {
        if (direction !== 'idle') {
          setDirection('idle');
          setStatusText('待机中');
        }
        return;
      }

      // 3. 到达楼层处理：仅在匹配方向时停车（SCAN）
      // 注意：如果电梯到达最低点（如1楼），方向为'down'，但遇到了'up'请求，它会在下一步4中掉头，然后下一次循环在停靠。
      const shouldStopUp = requestsUp.has(currentFloor) && (direction === 'up' || direction === 'idle');
      const shouldStopDown = requestsDown.has(currentFloor) && (direction === 'down' || direction === 'idle');

      if (shouldStopUp || shouldStopDown) {
        handleArrival(currentFloor);
        return;
      }

      // 4. 决定方向（SCAN/LOOK）
      let nextDirection = direction;

      if (direction === 'idle') {
        // *** 修复逻辑：空闲时，查找任何方向的请求来决定移动方向 ***
        const hasAnyAbove = 
          Array.from(requestsUp).some(f => f > currentFloor) || 
          Array.from(requestsDown).some(f => f > currentFloor);
        
        const hasAnyBelow = 
          Array.from(requestsUp).some(f => f < currentFloor) || 
          Array.from(requestsDown).some(f => f < currentFloor);

        if (hasAnyAbove) {
          nextDirection = 'up';
          setDirection('up');
        } else if (hasAnyBelow) {
          nextDirection = 'down';
          setDirection('down');
        } else {
          // 如果请求在当前层，但上面步骤没停（通常是因为请求方向不匹配），则建立一个方向去停靠
          if (requestsUp.has(currentFloor)) {
             nextDirection = 'up';
             setDirection('up');
          } else if (requestsDown.has(currentFloor)) {
             nextDirection = 'down';
             setDirection('down');
          }
        }
        // *** 修复逻辑结束 ***

      } else if (direction === 'up') {
        // 若上方还有上行请求，继续上行；否则若下方有请求，则转向下行
        if (!hasUpAbove(currentFloor, requestsUp)) {
          // 本方向（上行）的匹配请求耗尽，考虑反向
          const hasAnyDownRequest = 
             hasDownAtOrBelow(currentFloor, requestsDown) || // 有下行请求在下方
             Array.from(requestsUp).some(f => f < currentFloor); // 或者有上行请求在下方

          if (hasAnyDownRequest) {
            nextDirection = 'down';
            setDirection('down');
          }
        }
      } else if (direction === 'down') {
        // 若下方还有下行请求，继续下行；否则若上方有请求，则转向下行
        if (!hasDownBelow(currentFloor, requestsDown)) {
          // 本方向（下行）的匹配请求耗尽，考虑反向
          const hasAnyUpRequest = 
            hasUpAtOrAbove(currentFloor, requestsUp) || // 有上行请求在上方
            Array.from(requestsDown).some(f => f > currentFloor); // 或者有下行请求在上方

          if (hasAnyUpRequest) {
            nextDirection = 'up';
            setDirection('up');
          }
        }
      }

      // 5. 移动电梯一层
      const nextFloor = nextDirection === 'up' ? currentFloor + 1
        : nextDirection === 'down' ? currentFloor - 1
          : currentFloor;

      // 边界检查
      if (nextFloor >= 1 && nextFloor <= TOTAL_FLOORS) {
        if (nextFloor !== currentFloor) {
          setStatusText(nextDirection === 'up' ? '上行中...' : (nextDirection === 'down' ? '下行中...' : '待机中'));
          setCurrentFloor(nextFloor);
        } else {
          // direction 仍为 idle，或在边界处发现方向无法移动，保持不动
        }
      } else {
        // 到达边界，重置为 Idle
        setDirection('idle');
        setStatusText('到达边界，重置待机');
      }
    };

    // 启动心跳
    timer = setInterval(processElevator, MOVE_INTERVAL);
    return () => clearInterval(timer);
  }, []); // 空依赖，完全依赖 Ref 读取最新状态

  // --- 辅助逻辑 ---

  // 到达楼层处理
  const handleArrival = (floor) => {
    const dir = stateRef.current.direction;
    setStatusText(`抵达 ${floor} 层 - 开门`);
    setIsDoorOpen(true);
    message.success(`电梯到达 ${floor} 层`);

    // 移除匹配方向的请求（idle 时两方向都可视为匹配）
    removeArrivalRequest(floor, dir);

    // 模拟开门等待后关门
    setTimeout(() => {
      setIsDoorOpen(false);
      setStatusText('关门 - 准备出发');
    }, DOOR_TIME);
  };

  // 内部面板添加请求（基于目标相对当前楼层分方向）
  const addInsideRequest = (floor) => {
    const { currentFloor } = stateRef.current;
    if (floor === currentFloor && isDoorOpen) {
      message.warning("已经在该楼层且门已开");
      return;
    }
    // 内部呼叫应该始终进入匹配其目标方向的集合
    if (floor > currentFloor) {
      setRequestsUp(prev => new Set(prev).add(floor));
    } else if (floor < currentFloor) {
      setRequestsDown(prev => new Set(prev).add(floor));
    } else {
      // 同层呼叫，放入请求多的或当前运行方向的集合，这里简单放入 Up 集合，主逻辑会处理
      setRequestsUp(prev => new Set(prev).add(floor));
    }
  };

  // 大厅呼叫（显式方向）
  const addHallCall = (floor, callDir) => {
    if (floor === currentFloor && isDoorOpen) {
      message.warning("电梯已在该楼层并开门");
      return;
    }
    if (callDir === 'up') {
      setRequestsUp(prev => new Set(prev).add(floor));
    } else {
      setRequestsDown(prev => new Set(prev).add(floor));
    }
  };

  // --- 渲染组件 ---

  // 渲染楼层列表 (1 -> TOTAL_FLOORS)
  const renderShaft = () => {
    const floors = [];
    for (let i = 1; i <= TOTAL_FLOORS; i++) {
      const upTag = requestsUp.has(i);
      const downTag = requestsDown.has(i);
      floors.push(
        <div key={i} style={styles.floor}>
          <span>{i}F</span>
          {!isInsideView && (
            <div>
              {upTag && <Tag color="blue" style={{ marginRight: 6 }}>上行呼叫</Tag>}
              {downTag && <Tag color="green">下行呼叫</Tag>}
            </div>
          )}
        </div>
      );
    }
    return floors;
  };

  // 渲染电梯轿厢（视觉块）
  const renderCar = () => {
    // 实际上 bottom 的值应该是 (currentFloor - 1) * FLOOR_HEIGHT
    const bottomPos = (currentFloor - 1) * FLOOR_HEIGHT + 2;
    return (
      <div
        style={{
          ...styles.elevatorCar,
          bottom: `${bottomPos}px`,
          ...(isDoorOpen ? styles.doorOpen : {}),
        }}
      >
        {isDoorOpen ? 'OPEN' : `${currentFloor}`}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <Row gutter={24}>
        {/* 左侧：电梯井道可视化 */}
        <Col span={10} lg={8}>
          <Card title="大楼剖面图" bordered={false}>
            <div style={styles.shaft}>
              {renderCar()}
              {renderShaft()}
            </div>
          </Card>
        </Col>

        {/* 右侧：控制面板 */}
        <Col span={14} lg={16}>
          {/* 状态监控 */}
          <Card style={{ marginBottom: 20 }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Statistic
                  title="当前楼层"
                  value={currentFloor}
                  prefix={<DingdingOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="运行状态"
                  value={statusText}
                  valueStyle={{
                    color: isDoorOpen ? '#52c41a' : (direction === 'idle' ? '#999' : '#1890ff'),
                    fontSize: '16px'
                  }}
                />
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  {direction === 'up' && <ArrowUpOutlined style={{ fontSize: 32, color: '#cf1322' }} />}
                  {direction === 'down' && <ArrowDownOutlined style={{ fontSize: 32, color: '#3f8600' }} />}
                  {direction === 'idle' && <PoweroffOutlined style={{ fontSize: 32, color: '#ccc' }} />}
                </div>
              </Col>
            </Row>
          </Card>

          {/* 交互控制区 */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{isInsideView ? "电梯内部面板" : "楼层呼叫面板 (大厅)"}</span>
                <Switch
                  checkedChildren="进入电梯"
                  unCheckedChildren="在大厅"
                  checked={isInsideView}
                  onChange={setIsInsideView}
                />
              </div>
            }
          >
            {isInsideView ? (
              // 内部视图：按楼层按钮（根据相对位置进入上/下集合）
              <div>
                <p>您在电梯内部，请选择要去往的楼层：</p>
                <div style={styles.panelGrid}>
                  {Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1).map(f => (
                    <Button
                      key={f}
                      type={requestsUp.has(f) || requestsDown.has(f) ? "primary" : "default"}
                      onClick={() => addInsideRequest(f)}
                      size="large"
                      disabled={currentFloor === f && isDoorOpen}
                    >
                      {f} 层
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              // 外部视图：召唤电梯（真实电梯的上/下方向按钮）
              <div>
                <p>选择上/下方向进行“大厅呼叫”：</p>
                <div style={{ height: '400px', overflowY: 'auto' }}>
                  {Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i).map(f => (
                    <div
                      key={f}
                      style={{
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #f0f0f0',
                        padding: '10px'
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>{f} 楼大厅</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          type={requestsUp.has(f) ? "primary" : "dashed"}
                          onClick={() => addHallCall(f, 'up')}
                          icon={<ArrowUpOutlined />}
                          disabled={f === TOTAL_FLOORS || (currentFloor === f && isDoorOpen)}
                        >
                          {requestsUp.has(f) ? "已呼叫上行" : "上行呼叫"}
                        </Button>
                        <Button
                          type={requestsDown.has(f) ? "primary" : "dashed"}
                          onClick={() => addHallCall(f, 'down')}
                          icon={<ArrowDownOutlined />}
                          disabled={f === 1 || (currentFloor === f && isDoorOpen)}
                        >
                          {requestsDown.has(f) ? "已呼叫下行" : "下行呼叫"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ElevatorSimulation;