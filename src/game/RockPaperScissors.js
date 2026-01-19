import React, { useState } from "react";
import { Button, message } from "antd";

const RockPaperScissors = () => {
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);

  const handleClick = (choice) => {
    // 随机生成电脑的选择
    const choices = ["石头", "剪刀", "布"];
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];

    // 判断游戏的结果
    const outcome = judge(choice, randomChoice);

    // 更新状态
    setUserChoice(choice);
    setComputerChoice(randomChoice);
    setResult(outcome);

    // 使用 message 组件显示结果
    const msgContent = `你的选择: ${choice}, 电脑的选择: ${randomChoice}. 结果: ${outcome}!`;
    if (outcome === '你赢了') {
      message.success(msgContent);
    } else if (outcome === '电脑赢了') {
      message.error(msgContent);
    } else {
      message.info(msgContent);
    }
  };

  const judge = (userChoice, computerChoice) => {
    // 如果用户和电脑的选择相同，返回平局
    if (userChoice === computerChoice) {
      return "平局";
    }
    // 使用更简洁的逻辑判断用户赢
    if (
      (userChoice === "石头" && computerChoice === "剪刀") ||
      (userChoice === "剪刀" && computerChoice === "布") ||
      (userChoice === "布" && computerChoice === "石头")
    ) {
      return "你赢了";
    }
    // 其他情况，返回电脑赢
    return "电脑赢了";
  };

  const handleRestart = () => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult(null);
    message.config({
        top: 24, // 调整提示位置，避免遮挡
        duration: 2,
    });
    message.info('游戏已重置，请再次选择！');
  };

  return (
    <div style={{ width: 300, margin: "20px auto", padding: "20px", border: "1px solid #eee", borderRadius: "8px", textAlign: "center" }}>
      <h1>石头剪刀布游戏</h1>
      <p>请从石头、剪刀、布中选择一个，看看你能否赢过电脑</p>
      
      <div style={{ marginBottom: "20px" }}>
        {/* 游戏开始：选择阶段 */}
        {!result && (
          <>
            <Button type="primary" onClick={() => handleClick("石头")}>
              石头
            </Button>
            <Button type="primary" onClick={() => handleClick("剪刀")} style={{ marginLeft: 10 }}>
              剪刀
            </Button>
            <Button type="primary" onClick={() => handleClick("布")} style={{ marginLeft: 10 }}>
              布
            </Button>
          </>
        )}
        
        {/* 游戏结束：显示结果 */}
        {result && (
          <div>
            <p>你的选择是：**{userChoice}**</p>
            <p>电脑的选择是：**{computerChoice}**</p>
            <p>**游戏的结果是：{result}**</p>
            <Button type="dashed" onClick={handleRestart} style={{ marginTop: 10 }}>
              重新开始
            </Button>
          </div>
        )}
      </div>

      {!result && userChoice !== null && (
        <p style={{ color: '#1890ff' }}>请选择，开始游戏！</p>
      )}
      
    </div>
  );
};

export default RockPaperScissors;