import React, { useState, useEffect } from "react";
import { Input, Button, message } from "antd";

// Game组件，猜数字的游戏
const Game = () => {
  // 状态变量，用于存储随机生成的目标数字
  const [target, setTarget] = useState(0);
  // 状态变量，用于存储用户输入的数字
  const [guess, setGuess] = useState("");
  // 状态变量，用于存储游戏是否结束
  const [isOver, setIsOver] = useState(false);

  // 使用useEffect钩子，在组件挂载时，生成一个1到100之间的随机整数，作为目标数字
  useEffect(() => {
    setTarget(Math.floor(Math.random() * 100) + 1);
  }, []);

  // 处理用户输入
  const handleChange = (e) => {
    // 获取用户输入的值
    const value = e.target.value;
    // 如果用户输入的是数字，更新状态变量
    if (/^\d*$/.test(value)) {
      setGuess(value);
    }
  };

  // 处理用户提交
  const handleSubmit = () => {
    // 如果用户没有输入数字，提示用户输入
    if (!guess) {
      message.error("请输入一个数字");
      return;
    }
    // 将用户输入的字符串转换为数字
    const num = parseInt(guess, 10);
    // 猜对了
    if (num === target) {
      message.success("恭喜你，猜对了！");
      setIsOver(true);
    }
    // 猜小了
    else if (num < target) {
      message.info("猜小了，再试试吧");
    }
    // 猜大了
    else if (num > target) {
      message.info("猜大了，再试试吧");
    }
  };

  // 处理重新开始的事件
  const handleRestart = () => {
    // 重新生成一个目标数字
    setTarget(Math.floor(Math.random() * 100) + 1);
    // 清空用户输入的数字
    setGuess("");
    // 重置游戏状态
    setIsOver(false);
  };

  return (
    <div style={{ width: 300, margin: "0 auto" }}>
      <h1>猜数字游戏</h1>
      <p>请输入一个1到100之间的数字，看看你能否猜中目标数字</p>
      {/* 如果游戏没有结束，显示输入框和提交按钮 */}
      {!isOver && (
        <div>
          <Input
            placeholder="请输入数字"
            value={guess}
            onChange={handleChange}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 10 }}>
            提交
          </Button>
        </div>
      )}
      {/* 如果游戏结束，显示重新开始按钮 */}
      {isOver && (
        <Button type="primary" onClick={handleRestart}>
          重新开始
        </Button>
      )}
    </div>
  );
};

// 导出Game组件
export default Game;
