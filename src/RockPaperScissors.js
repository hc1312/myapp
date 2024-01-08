import React, { useState } from "react";
import { Button, message } from "antd";

// 定义一个RockPaperScissors组件，用于实现石头剪刀布的游戏
const RockPaperScissors = () => {
  // 定义一个状态变量，用于存储用户的选择
  const [userChoice, setUserChoice] = useState(null);
  // 定义一个状态变量，用于存储电脑的选择
  const [computerChoice, setComputerChoice] = useState(null);
  // 定义一个状态变量，用于存储游戏的结果
  const [result, setResult] = useState(null);

  // 定义一个函数，用于处理用户点击按钮的事件
  const handleClick = (choice) => {
    // 更新用户的选择
    setUserChoice(choice);
    // 随机生成电脑的选择
    const choices = ["石头", "剪刀", "布"];
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    // 更新电脑的选择
    setComputerChoice(randomChoice);
    // 判断游戏的结果
    const outcome = judge(choice, randomChoice);
    // 更新游戏的结果
    setResult(outcome);
  };

  // 定义一个函数，用于判断游戏的结果
  const judge = (userChoice, computerChoice) => {
    // 如果用户和电脑的选择相同，返回平局
    if (userChoice === computerChoice) {
      return "平局";
    }
    // 如果用户选择石头，电脑选择剪刀，返回用户赢
    if (userChoice === "石头" && computerChoice === "剪刀") {
      return "你赢了";
    }
    // 如果用户选择剪刀，电脑选择布，返回用户赢
    if (userChoice === "剪刀" && computerChoice === "布") {
      return "你赢了";
    }
    // 如果用户选择布，电脑选择石头，返回用户赢
    if (userChoice === "布" && computerChoice === "石头") {
      return "你赢了";
    }
    // 其他情况，返回电脑赢
    return "电脑赢了";
  };

  // 定义一个函数，用于处理用户重新开始的事件
  const handleRestart = () => {
    // 重置用户的选择
    setUserChoice(null);
    // 重置电脑的选择
    setComputerChoice(null);
    // 重置游戏的结果
    setResult(null);
  };

  return (
    <div style={{ width: 300, margin: "0 auto" }}>
      <h1>石头剪刀布游戏</h1>
      <p>请从石头、剪刀、布中选择一个，看看你能否赢过电脑</p>
      {/* 如果游戏没有结束，显示三个按钮，分别表示石头、剪刀、布 */}
      {!result && (
        <div>
          <Button type="primary" onClick={() => handleClick("石头")}>
            石头
          </Button>
          <Button type="primary" onClick={() => handleClick("剪刀")} style={{ marginLeft: 10 }}>
            剪刀
          </Button>
          <Button type="primary" onClick={() => handleClick("布")} style={{ marginLeft: 10 }}>
            布
          </Button>
        </div>
      )}
      {/* 如果游戏结束，显示用户和电脑的选择，以及游戏的结果 */}
      {result && (
        <div>
          <p>你的选择是：{userChoice}</p>
          <p>电脑的选择是：{computerChoice}</p>
          <p>游戏的结果是：{result}</p>
          <Button type="primary" onClick={handleRestart}>
            重新开始
          </Button>
        </div>
      )}
    </div>
  );
};

// 导出RockPaperScissors组件
export default RockPaperScissors;
