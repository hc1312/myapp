import React, { useState } from "react";
import { Menu, Layout, ConfigProvider ,theme } from "antd";
import TeamTable from "./TeamTable";
import Game from "./game/Game";
import RockPaperScissors from "./RockPaperScissors";

import DiceGame from "./dice2";
import UnivTable from "./UnivTable";
import Yala from "./yala";
import MessageBoard from "./MessageBoard";
import SnakeGame from "./game/snake";
import UserTable from "./UserTable";
import ImageCarousel from "./ImageCarousel";
import Handlefile from "./file/handle";

// 引入React Router的组件
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Mole from "./game/mole";

const { Sider, Content } = Layout; // 解构Layout的子组件
const { SubMenu } = Menu; // 解构Menu的子组件

export default function App() {
  // 定义一个状态变量，用于存储当前选中的菜单项
  const [selectedMenu, setSelectedMenu] = useState("premierLeague");

  // 定义一个函数，用于处理菜单项的点击事件
  const handleMenuClick = (e) => {
    // 更新选中的菜单项
    setSelectedMenu(e.key);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          "colorPrimary": "#af86ef",
          "colorInfo": "#af86ef",
          "fontSize": 14,
          "sizeStep": 4,
          "borderRadius": 8,
          "colorBgBase": "#d7f9c6"
        },
      }}
    >
      <Layout style={{ height: "100vh" }}>
        {/* 使用BrowserRouter包裹整个应用 */}
        <BrowserRouter>
          {/* 左侧菜单，垂直模式 */}
          <Sider
            breakpoint="lg" // 设置响应式断点，当屏幕宽度小于992px时，侧边栏会自动折叠
            collapsedWidth="0" // 设置折叠后的宽度为0，这样侧边栏会完全隐藏，只显示一个特殊的触发器
          >
            <Menu
              onClick={handleMenuClick}
              selectedKeys={[selectedMenu]}
              mode="vertical"
            >
              {/* 使用Link组件来创建导航链接，to属性指定对应的路径 */}
              <Menu.Item key="premierLeague"><Link to="/">联赛</Link></Menu.Item>
              <SubMenu key="game" title="游戏" popupOffset={[0, 0]}>
                <Menu.Item key="num"><Link to="/num">猜数字</Link></Menu.Item>
                <Menu.Item key="snake"><Link to="/snake">贪吃蛇</Link></Menu.Item>
                <Menu.Item key="mole"><Link to="/mole">打地鼠</Link></Menu.Item>
              </SubMenu>
              <Menu.Item key="rockpaperscissors"><Link to="/rockpaperscissors">石头剪刀布</Link></Menu.Item>
              <Menu.Item key="univtable"><Link to="/univtable">排名</Link></Menu.Item>
              <Menu.Item key="dice2"><Link to="/dice2">掷骰子</Link></Menu.Item>
              <Menu.Item key="yala"><Link to="/yala">介绍评价</Link></Menu.Item>
              <Menu.Item key="messageboard"><Link to="/messageboard">留言板</Link></Menu.Item>
              <Menu.Item key="user"><Link to="/user">用户表</Link></Menu.Item>
              <Menu.Item key="ImageCarousel"><Link to="/ImageCarousel">美图欣赏</Link></Menu.Item>
              <Menu.Item key="file"><Link to="/file">文件</Link></Menu.Item>
            </Menu>
          </Sider>
          {/* 右侧内容，使用Routes和Route组件来定义路由规则 */}
          <Content>
            <Routes>
              {/* 每个Route组件表示一个路由规则，path属性指定匹配的路径，element属性指定渲染的组件 */}
              <Route path="/" element={<TeamTable league="premierLeague" />} />
              <Route path="/num" element={<Game />} />
              <Route path="/rockpaperscissors" element={<RockPaperScissors />} />
              <Route path="/univtable" element={<UnivTable />} />
              <Route path="/dice2" element={<DiceGame />} />
              <Route path="/yala" element={<Yala />} />
              <Route path="/messageboard" element={<MessageBoard />} />
              <Route path="/user" element={<UserTable />} />
              <Route path="/ImageCarousel" element={<ImageCarousel />} />
              <Route path="/file" element={<Handlefile />} />
              <Route path="/snake" element={<SnakeGame />} />
              <Route path="/mole" element={<Mole />} />
            </Routes>
          </Content>
        </BrowserRouter>
      </Layout>
    </ConfigProvider>
  );

}
