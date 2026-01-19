import React, { useState, useRef } from "react";
import { Input, Button, message } from "antd";
import ReactDice, { ReactDiceRef } from "react-dice-complete";

const DiceGame = () => {
  const [actions, setActions] = useState(["", "", "", "", "", ""]);
  const [dice, setDice] = useState(0); 
  const [isStarted, setIsStarted] = useState(false);
  const reactDice = useRef < ReactDiceRef > (null);

  const handleChange = (e, index) => {
    const value = e.target.value;
    const newActions = [...actions];
    newActions[index] = value;
    setActions(newActions);
  };

  const handleStart = () => {
    // 检查所有动作是否已输入
    for (let i = 0; i < actions.length; i++) {
      if (!actions[i]) {
        message.error("请为每个点数输入一个事件");
        return;
      }
    }
    setIsStarted(true);
    setDice(1); 
  };

  const handleRoll = () => {
    reactDice.current?.rollAll();
  };

  const rollDone = (totalValue, values) => {
    setDice(totalValue);
    message.info(`你掷出了${totalValue}，所以你决定${actions[totalValue - 1]}`);
  };

  const handleRestart = () => {
    setActions(["", "", "", "", "", ""]);
    setDice(0);
    setIsStarted(false);
  };

  return (
    <div style={{ width: 300, margin: "0 auto" }}>
      <h1>掷骰子游戏</h1>
      <p>请为每个可能的点数输入你要做的事情，然后开始掷骰子，看看你要去做什么</p>
      {/* 输入阶段 */}
      {!isStarted && (
        <div>
          {actions.map((action, index) => (
            <Input
              key={index}
              placeholder={`请输入掷出${index + 1}时你要做的事情`}
              value={action}
              onChange={(e) => handleChange(e, index)}
              style={{ marginBottom: 10 }}
            />
          ))}
          <Button type="primary" onClick={handleStart}>
            确定了，准备掷骰子吧
          </Button>
        </div>
      )}
      {/* 游戏进行中 */}
      {isStarted && (
        <div>
          <ReactDice
            numDice={1}
            useRef={reactDice}
            rollDone={rollDone}
            faceColor="white"
            dotColor="red"
          />
          <Button type="primary" onClick={handleRoll}>
            点击上面的骰子来掷！
          </Button>
          <Button type="primary" onClick={handleRestart} style={{ marginTop: 10 }}>
            改主意了？点此重新输入
          </Button>
        </div>
      )}
      {/* 结果显示 */}
      <div style={{ marginTop: 10 }}>
        <p>你掷出的点数是：{dice}</p>
        <p>你要做的动作是：{actions[dice - 1]}</p>
      </div>
    </div>
  );
};

export default DiceGame;
