import React, { useState, useRef } from "react";
import { Card, Button, Typography } from "antd"; // 引入 antd 的组件

const { Paragraph } = Typography; // 引入 antd 的 Typography 组件的子组件

const Mole = () => {
  const gridSize = 9;
  const moleTime = 1000;
  const gameTime = 10000;

  const [index, setIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const moleTimer = useRef();
  const gameTimer = useRef();

  const generateIndex = () => {
    const randomIndex = Math.floor(Math.random() * gridSize);
    if (randomIndex === index) {
      generateIndex();
    } else {
      setIndex(randomIndex);
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setScore(0);
    generateIndex();
    moleTimer.current = setInterval(generateIndex, moleTime);
    gameTimer.current = setTimeout(endGame, gameTime);
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsFinished(true);
    setIndex(-1);
    clearInterval(moleTimer.current);
    clearTimeout(gameTimer.current);
  };

const onClick = (n) => {
  if (isPlaying && index === n) {
    setScore((score) => score + 1);
    generateIndex();
  }
};


  return (
    // 使用 antd 的 Card 组件来包裹你的游戏
    <Card title="打地鼠" bordered={false}>
      {/* 使用 antd 的 Button 组件来替换原来的 button 元素 */}
      {!isPlaying && !isFinished && (
        <Button onClick={startGame} type="primary">
          开始游戏
        </Button>
      )}
      {isFinished && (
        <Button onClick={startGame} type="primary">
          重新开始游戏
        </Button>
      )}
      {/* 使用 antd 的 Typography 组件来显示玩家的得分 */}
      <Paragraph>得分：{score}</Paragraph>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.sqrt(gridSize)}, 1fr)`,
          gap: "10px",
          width: "300px",
          margin: "auto",
        }}
      >
        {Array.from({ length: gridSize }).map((_, n) => {
          if (index === n) {
            return (
              <div key={n}>
                <img
                  src="../images/mole.jpg"
                  alt="mole"
                  width="100%"
                  onClick={() => onClick(n)}
                />
              </div>
            );
          } else {
            return (
              <div
                key={n}
                style={{
                  width: "100%",
                  height: "0",
                  paddingBottom: "100%",
                  borderRadius: "50%",
                  backgroundColor: "brown",
                }}
              ></div>
            );
          }
        })}
      </div>
    </Card>
  );
};

export default Mole;
