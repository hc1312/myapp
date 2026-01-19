import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Modal, Button } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
const { Title, Paragraph } = Typography;

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

// 📳 震动工具
const vibrate = (ms) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const randomFood = () => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

export default function SnakeGame() {
  const isMobile = window.innerWidth < 768;

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(randomFood());
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);

  const speedRef = useRef(200);
  const touchStartRef = useRef(null);

  /* ================= 游戏主循环 ================= */
  useEffect(() => {
    if (gameOver) return;
    const timer = setTimeout(moveSnake, speedRef.current);
    return () => clearTimeout(timer);
  }, [snake]);

  const moveSnake = () => {
    const head = snake[0];
    const move = DIRECTIONS[direction];
    const newHead = {
      x: (head.x + move.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + move.y + GRID_SIZE) % GRID_SIZE,
    };

    // 💀 撞自己
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      vibrate(200);
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    // 🍎 吃食物
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(randomFood());
      speedRef.current *= 0.95;
      vibrate(20);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  /* ================= 方向控制（通用） ================= */
  const changeDirection = (newDir) => {
    if (OPPOSITE[direction] === newDir) return;
    if (direction !== newDir) {
      setDirection(newDir);
      vibrate(8);
    }
  };

  /* ================= PC：键盘 ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.key === 'ArrowUp') changeDirection('UP');
      if (e.key === 'ArrowDown') changeDirection('DOWN');
      if (e.key === 'ArrowLeft') changeDirection('LEFT');
      if (e.key === 'ArrowRight') changeDirection('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver]);

  /* ================= 移动端：触摸滑动 ================= */
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0];
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.clientX;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.clientY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) changeDirection('RIGHT');
      if (dx < -30) changeDirection('LEFT');
    } else {
      if (dy > 30) changeDirection('DOWN');
      if (dy < -30) changeDirection('UP');
    }
  };

  /* ================= 重开 ================= */
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(randomFood());
    setDirection('RIGHT');
    setGameOver(false);
    speedRef.current = 200;
  };

  return (
    <Card title={<Title level={4}>🐍 贪吃蛇（PC + 移动通用）</Title>}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: '90vw',
          maxWidth: 420,
          aspectRatio: '1',
          margin: '0 auto',
          border: '2px solid #333',
          touchAction: 'none',
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              style={{
                background: isSnake ? '#222' : isFood ? '#ff4d4f' : '#fff',
                border: '1px solid #eee',
              }}
            />
          );
        })}
      </div>

      <Paragraph style={{ textAlign: 'center', marginTop: 10 }}>
        分数：{snake.length - INITIAL_SNAKE.length}
      </Paragraph>
      <Paragraph type="secondary" style={{ textAlign: 'center' }}>
        PC 用方向键｜手机可以用手势滑动
      </Paragraph>
      {isMobile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 60px)',
          gap: '10px',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <div />
          <Button icon={<ArrowUpOutlined />} onClick={() => changeDirection('UP')} />
          <div />
          <Button icon={<ArrowLeftOutlined />} onClick={() => changeDirection('LEFT')} />
          <Button icon={<ArrowDownOutlined />} onClick={() => changeDirection('DOWN')} />
          <Button icon={<ArrowRightOutlined />} onClick={() => changeDirection('RIGHT')} />
        </div>
      )}
      <Modal
        open={gameOver}
        onOk={restartGame}
        onCancel={restartGame}
        okText="再来一局"
        cancelText="取消"
      >
        游戏结束 😭<br />
        得分：{snake.length - INITIAL_SNAKE.length}
      </Modal>
    </Card>
  );
}
