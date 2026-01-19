import React, { useRef, useEffect, useState } from 'react';
import { Card, Button, Typography, Modal, Statistic, Space, Row, Col, Select } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
  HeartFilled
} from '@ant-design/icons';

const { Title } = Typography;

// --- 游戏配置常量 ---
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 80;
const BALL_RADIUS = 6;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 35;
const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;
const BRICK_HEIGHT = 20;

const BreakoutGame = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // React 状态：仅用于 UI 显示
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(true);
  const [gameStatus, setGameStatus] = useState('ready');
  // 1. 增加速度状态 (默认 1倍)
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const isPausedRef = useRef(isPaused);
  const gameStatusRef = useRef(gameStatus);

  // 游戏核心数据 Ref (使用 Ref 存储快速变化的位置数据)
  const gameData = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    dx: 4,
    dy: -4,
    paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    bricks: [],
    isInitialized: false
  });

  useEffect(() => {
    isPausedRef.current = isPaused;
    gameStatusRef.current = gameStatus;
  }, [isPaused, gameStatus]);

  // --- 初始化和重置逻辑 (未变) ---
  const initBricks = () => {
    const newBricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        newBricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    gameData.current.bricks = newBricks;
    gameData.current.isInitialized = true;
  };

  const resetBall = (data, multiplier = 1) => {
    const baseSpeed = 4;
    data.x = CANVAS_WIDTH / 2;
    data.y = CANVAS_HEIGHT - 30;
    // 根据倍率调整初速度
    data.dx = baseSpeed * multiplier;
    data.dy = -baseSpeed * multiplier;
    data.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  };

  // --- 绘制函数 (未变) ---
  const drawBall = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#1890ff';
    ctx.fill();
    ctx.closePath();
  };

  const drawPaddle = (ctx, paddleX) => {
    ctx.beginPath();
    ctx.rect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#2f54eb';
    ctx.fill();
    ctx.closePath();
  };

  const drawBricks = (ctx, bricks) => {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
          const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
          const colors = ['#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d', '#bae637'];
          ctx.fillStyle = colors[r % colors.length];
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  // --- 物理与逻辑 (未变) ---
  const moveBall = (data) => {
    if (data.x + data.dx > CANVAS_WIDTH - BALL_RADIUS || data.x + data.dx < BALL_RADIUS) {
      data.dx = -data.dx;
    }

    if (data.y + data.dy < BALL_RADIUS) {
      data.dy = -data.dy;
    }
    else if (data.y + data.dy > CANVAS_HEIGHT - BALL_RADIUS) {
      if (data.x > data.paddleX && data.x < data.paddleX + PADDLE_WIDTH) {
        let hitPoint = data.x - (data.paddleX + PADDLE_WIDTH / 2);
        hitPoint = hitPoint / (PADDLE_WIDTH / 2);
        data.dx = hitPoint * 5;
        data.dy = -Math.abs(data.dy);
      } else {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameStatus('gameover');
            setIsPaused(true);
          } else {
            resetBall(data);
          }
          return newLives;
        });
      }
    }

    data.x += data.dx;
    data.y += data.dy;
  };

  const collisionDetection = (data) => {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const b = data.bricks[c][r];
        if (b.status === 1) {
          if (
            data.x > b.x &&
            data.x < b.x + BRICK_WIDTH &&
            data.y > b.y &&
            data.y < b.y + BRICK_HEIGHT
          ) {
            data.dy = -data.dy;
            b.status = 0;
            setScore(prev => prev + 10);
          }
        }
      }
    }
  };

  const checkGameEnd = (data) => {
    let isWin = true;
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        if (data.bricks[c][r].status === 1) isWin = false;
      }
    }
    if (isWin) {
      setGameStatus('won');
      setIsPaused(true);
    }
  };


  // --- 核心游戏循环 (Loop) ---
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      // 如果 canvas 引用丢失，仍尝试调用下一帧，以防止循环完全终止
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    const ctx = canvas.getContext('2d');
    const data = gameData.current;

    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 绘制元素
    drawBricks(ctx, data.bricks);
    drawBall(ctx, data.x, data.y);
    drawPaddle(ctx, data.paddleX);

    // --- 关键修改 3: 使用 Ref 访问最新状态 ---
    if (!isPausedRef.current && (gameStatusRef.current === 'playing')) {
      collisionDetection(data);
      moveBall(data);
      checkGameEnd(data);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const mouseMoveHandler = (e) => {
    // 1. 使用 Ref 访问最新状态
    if (isPausedRef.current || gameStatusRef.current !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 获取 Canvas 元素在视口中的精确位置信息
    const rect = canvas.getBoundingClientRect();

    // ✅ 关键修改: 使用 getBoundingClientRect 计算相对位置
    const relativeX = e.clientX - rect.left;

    // 2. 更新挡板位置并进行边界钳制
    if (relativeX > 0 && relativeX < CANVAS_WIDTH) {

      const newPaddleX = relativeX - PADDLE_WIDTH / 2;

      // 确保挡板位置不会超出左右边界
      gameData.current.paddleX = Math.min(
        Math.max(newPaddleX, 0),                       // 不小于 0 (左边界)
        CANVAS_WIDTH - PADDLE_WIDTH                     // 不大于 Canvas 宽度 - 挡板宽度 (右边界)
      );
    }
  };
  const touchMoveHandler = (e) => {
    if (isPausedRef.current || gameStatusRef.current !== 'playing') return;
    // 阻止移动端浏览器默认的下拉刷新或滚动行为
    if (e.cancelable) e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // 获取第一个触碰点相对于画布的 X 坐标
    const relativeX = e.touches[0].clientX - rect.left;

    if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
      const newPaddleX = relativeX - PADDLE_WIDTH / 2;
      gameData.current.paddleX = Math.min(Math.max(newPaddleX, 0), CANVAS_WIDTH - PADDLE_WIDTH);
    }
  };
  // --- React 生命周期 ---

  // 1. 初始化和启动循环
  useEffect(() => {
    initBricks();
    requestRef.current = requestAnimationFrame(gameLoop);
    // 销毁时清理循环
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // 仅运行一次

  // 2. 监听游戏状态变化以弹出 Modal (未变)
  useEffect(() => {
    if (gameStatus === 'gameover') {
      Modal.error({
        title: '游戏结束',
        content: `最终得分: ${score}`,
        okText: '重新开始',
        onOk: restartGame,
        keyboard: false,
        maskClosable: false
      });
    } else if (gameStatus === 'won') {
      Modal.success({
        title: '恭喜通关！',
        content: `你太棒了！最终得分: ${score}`,
        okText: '再玩一次',
        onOk: restartGame,
        keyboard: false,
        maskClosable: false
      });
    }
  }, [gameStatus, score]); // 依赖 score，确保 modal 显示正确分数

  // --- 控制操作 (未变) ---
  const startGame = () => {
    setGameStatus('playing');
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const restartGame = () => {
    setScore(0);
    setLives(3);
    setGameStatus('ready');
    setIsPaused(true);
    initBricks();
    resetBall(gameData.current);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>React + Antd 打砖块</Title>
            <Space size="large">
              <Statistic
                title="分数"
                value={score}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ fontSize: 18 }}
              />
              <Statistic
                title="生命"
                value={lives}
                prefix={<HeartFilled style={{ color: '#ff4d4f' }} />}
                valueStyle={{ fontSize: 18 }}
              />
            </Space>
          </div>
        }
        bordered={false}
        style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onTouchMove={touchMoveHandler}
          onMouseMove={mouseMoveHandler}
          style={{
            background: '#000',
            cursor: isPaused ? 'default' : 'none',
            borderRadius: '4px',
            display: 'block',
            width: '100%',        // 关键：宽度随父容器自适应
            maxWidth: '1000px',   // 保持最大宽度 
            height: 'auto',       // 保持比例
            touchAction: 'none'   // 关键：禁用浏览器的默认触摸手势
          }}
        />

        <Row justify="center" style={{ marginTop: 20 }}>
          <Col>
            <Space>
              {gameStatus === 'ready' && (
                <>
                  {/* 插入速度选择器 */}
                  <Select
                    defaultValue={1}
                    style={{ width: 100 }}
                    onChange={(val) => {
                      setSpeedMultiplier(val);
                      // 如果游戏还没开始，立即应用速度预览
                      if (gameStatus === 'ready') resetBall(gameData.current, val);
                    }}
                    options={[
                      { value: 0.5, label: '慢速' },
                      { value: 1, label: '标准' },
                      { value: 1.5, label: '快速' },
                      { value: 2, label: '极速' },
                    ]}
                  />
                  <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={startGame}>
                    开始游戏
                  </Button>
                </>
              )}

              {gameStatus === 'playing' && (
                <Button
                  size="large"
                  icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                  onClick={togglePause}
                >
                  {isPaused ? '继续' : '暂停'}
                </Button>
              )}

              <Button icon={<ReloadOutlined />} size="large" onClick={restartGame}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginTop: 15, textAlign: 'center', color: '#888' }}>
          <Typography.Text type="secondary">
            {gameStatus === 'playing' && !isPaused ? '移动鼠标控制蓝色挡板，不要让球掉落' : '点击“开始游戏”启动'}
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
};

export default BreakoutGame;