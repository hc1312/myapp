import React, { useState, useRef } from "react";
import { Input, Button, message } from "antd";
import ReactDice, { ReactDiceRef } from "react-dice-complete";

// 定义一个DiceGame组件，用于实现掷骰子的游戏
const DiceGame = () => {
  // 状态变量，用于存储用户输入的6个动作
  const [actions, setActions] = useState(["", "", "", "", "", ""]);
  //状态变量，用于存储骰子的点数
  const [dice, setDice] = useState(0); // 改为0
  // 状态变量，用于存储游戏是否开始
  const [isStarted, setIsStarted] = useState(false);
  // ref变量，用于获取ReactDice组件的实例
  const reactDice = useRef < ReactDiceRef > (null);

  // 定义一个函数，用于处理用户输入的变化
  const handleChange = (e, index) => {
    // 获取用户输入的值
    const value = e.target.value;
    // 复制动作的状态数组
    const newActions = [...actions];
    // 更新对应索引的动作
    newActions[index] = value;
    // 设置动作的状态
    setActions(newActions);
  };

  // 定义一个函数，用于处理用户开始游戏的事件
  const handleStart = () => {
    // 遍历动作的数组，判断是否有空值
    for (let i = 0; i < actions.length; i++) {
      if (!actions[i]) {
        // 如果有空值，提示用户输入完整
        message.error("请为每个点数输入一个事件");
        return;
      }
    }
    // 如果没有空值，更新游戏状态
    setIsStarted(true);
    // 重置骰子的状态
    setDice(1); // 加上这一行
  };

  // 处理用户掷骰子的事件
  const handleRoll = () => {
    // 调用ReactDice组件的rollAll方法，随机生成一个骰子的点数
    reactDice.current?.rollAll();
  };

  // 定义一个函数，用于处理骰子掷完后的回调
  const rollDone = (totalValue, values) => {
    // 设置骰子的状态
    setDice(totalValue); // 改为totalValue
    // 根据点数和动作的对应关系，输出结果
    message.info(`你掷出了${totalValue}，所以你决定${actions[totalValue - 1]}`);
  };

  // 定义一个函数，用于处理用户重新开始的事件
  const handleRestart = () => {
    // 重置动作的状态
    setActions(["", "", "", "", "", ""]);
    // 重置骰子的状态
    setDice(0);
    // 重置游戏状态
    setIsStarted(false);
  };

  return (
    <div style={{ width: 300, margin: "0 auto" }}>
      <h1>掷骰子游戏</h1>
      <p>请为每个可能的点数输入你要做的事情，然后开始掷骰子，看看你要去做什么</p>
      {/* 如果游戏没有开始，显示6个输入框，分别表示1到6的点数对应的动作 */}
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
      {/* 如果游戏开始，显示一个有动画效果的骰子，和一个按钮，表示掷骰子 */}
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
      {/* 在页面上展示用户掷出的点数和对应的动作 */}
      <div style={{ marginTop: 10 }}>
        <p>你掷出的点数是：{dice}</p>
        <p>你要做的动作是：{actions[dice - 1]}</p>
      </div>
    </div>
  );
};

// 导出DiceGame组件
export default DiceGame;
