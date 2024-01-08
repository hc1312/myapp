import React, { useState, useEffect, useRef } from "react";

const Mole = () => {
  // 定义一些常量，用来设置游戏的参数
  const gridSize = 9; // 网格的大小，即地鼠的数量
  const moleTime = 1000; // 地鼠出现的时间间隔，单位毫秒
  const gameTime = 10000; // 游戏的总时间，单位毫秒

  // 定义一些状态，用来保存游戏的数据
  const [index, setIndex] = useState(-1); // 地鼠出现的位置的索引，初始值为 -1，表示没有地鼠出现
  const [score, setScore] = useState(0); // 玩家的得分，初始值为 0
  const [isPlaying, setIsPlaying] = useState(false); // 游戏是否正在进行，初始值为 false
  const [isFinished, setIsFinished] = useState(false); // 游戏是否已经结束，初始值为 false

  // 定义一些引用，用来保存游戏的定时器
  const moleTimer = useRef(); // 用来控制地鼠出现的定时器
  const gameTimer = useRef(); // 用来控制游戏结束的定时器

  // 定义一个函数，用来生成一个随机的索引，表示地鼠出现的位置
  const generateIndex = () => {
    // 生成一个 0 到 gridSize - 1 之间的随机整数
    const randomIndex = Math.floor(Math.random() * gridSize);
    // 如果随机数和当前的索引相同，就重新生成一个
    if (randomIndex === index) {
      generateIndex();
    } else {
      // 否则，就更新索引的状态
      setIndex(randomIndex);
    }
  };

  // 定义一个函数，用来开始游戏
  const startGame = () => {
    // 设置游戏正在进行的状态为 true
    setIsPlaying(true);
    // 设置游戏已经结束的状态为 false
    setIsFinished(false);
    // 设置玩家的得分为 0
    setScore(0);
    // 调用 generateIndex 函数，生成第一个地鼠的位置
    generateIndex();
    // 启动一个定时器，每隔 moleTime 毫秒，就调用一次 generateIndex 函数，更新地鼠的位置
    moleTimer.current = setInterval(generateIndex, moleTime);
    // 启动另一个定时器，当游戏时间达到 gameTime 毫秒时，就调用 endGame 函数，结束游戏
    gameTimer.current = setTimeout(endGame, gameTime);
  };

  // 定义一个函数，用来结束游戏
  const endGame = () => {
    // 设置游戏正在进行的状态为 false
    setIsPlaying(false);
    // 设置游戏已经结束的状态为 true
    setIsFinished(true);
    // 设置地鼠的位置的索引为 -1，表示没有地鼠出现
    setIndex(-1);
    // 清除地鼠出现的定时器
    clearInterval(moleTimer.current);
    // 清除游戏结束的定时器
    clearTimeout(gameTimer.current);
  };

  // 定义一个函数，用来处理点击事件
  const onClick = (n) => {
    // 如果游戏正在进行，并且点击的位置的索引和地鼠的位置的索引相同
    if (isPlaying && index === n) {
      // 就增加玩家的得分
      setScore((score) => score + 1);
    }
  };

  return (
    <div>
      <h1>打地鼠</h1>
      {/* 如果游戏没有开始，就显示开始游戏的按钮 */}
      {!isPlaying && !isFinished && (
        <button onClick={startGame}>开始游戏</button>
      )}
      {/* 如果游戏已经结束，就显示重新开始游戏的按钮 */}
      {isFinished && <button onClick={startGame}>重新开始游戏</button>}
      {/* 显示玩家的得分 */}
      <p>得分：{score}</p>
      {/* 使用一个 div 来显示网格，用来放置地鼠和洞 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.sqrt(gridSize)}, 1fr)`,
          gap: "10px",
          width: "300px",
          margin: "auto",
        }}
      >
        {/* 根据网格的大小，生成对应数量的 div，用来表示地鼠或洞 */}
        {Array.from({ length: gridSize }).map((_, n) => {
          // 如果当前的索引和地鼠的位置的索引相同，就显示地鼠的图片
          if (index === n) {
            return (
              <div key={n}>
                <img
                  src="https://grid.gograph.com/happy-mole-cartoon-vector-art_gg68718247.jpg"
                  alt="mole"
                  width="100%"
                  onClick={() => onClick(n)}
                />
              </div>
            );
          } else {
            // 否则，就显示一个空洞
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
    </div>
  );
};

export default Mole;
