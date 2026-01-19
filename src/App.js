import React, { useState, useEffect } from "react";
import { Menu, Layout, ConfigProvider, FloatButton, Drawer, message } from "antd";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  PictureOutlined,
  GiftOutlined,
  AppstoreOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  TableOutlined,
  RocketOutlined,
  CoffeeOutlined,
  AimOutlined,
  LogoutOutlined,
  UserOutlined,
  WechatOutlined
} from '@ant-design/icons';

import TeamManagement from "./worldcup/TeamManagement";
import Gomoku from "./game/Gomoku";
import RockPaperScissors from "./game/RockPaperScissors";
import BreakoutGame from "./game/BreakoutGame";
import DiceGame from "./dice2";
import CustomStrategyGame from "./game/CustomStrategyGame";
import CaptiveChessGame from "./game/CaptiveChessGame";
import Yala from "./yala";
import MessageBoard from "./MessageBoard";
import SnakeGame from "./game/snake";
import WelcomePage from "./WelcomePage";
import Mole from "./game/mole";
import ElevatorSimulation from "./Elevator";
import SubwaySimulation from "./subway/SubwaySimulation";
import TerrainRPSGame from "./game/TerrainRPSGame";
import WorldCupGroups from "./worldcup/WordCupGroup";
import MatchManagement from "./worldcup/MatchManagement";
import ParticleBackground from "./background";
import PhotoAlbum from "./PhotoAlbum";
import NewYearWish from "./Christmas/NewYearWish";
import Login from "./login";
import UserTable from "./UserTable";
import WeChatWindow from "./toy/WeChatWindow";
import VirtualShop from "./toy/VirtualShop";
import AIChat from "./ai/AIChat";

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

// --- 原有样式定义 (完整保留) ---
const mobileLinkStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: '#666',
  fontSize: '10px',
  textDecoration: 'none',
  flex: 1,
  transition: 'all 0.3s'
};

const activeMobileLinkStyle = {
  ...mobileLinkStyle,
  color: '#ff4d6d',
  fontWeight: 'bold'
};

// --- 路由守卫：只有登录了才能看到秘密花园哦 ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// --- 📱 手机端专用：底部导航栏 (完整保留) ---
const MobileTabBar = () => {
  const location = useLocation();
  const getStyle = (path) => location.pathname === path ? activeMobileLinkStyle : mobileLinkStyle;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px',
      background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(15px)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      borderTop: '1px solid rgba(0,0,0,0.05)', zIndex: 2000,
      paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
    }}>
      <Link to="/" style={getStyle("/")}><HomeOutlined style={{ fontSize: 18 }} /><span>首页</span></Link>
      <Link to="/album" style={getStyle("/album")}><PictureOutlined style={{ fontSize: 18 }} /><span>相册</span></Link>
      <Link to="/NewYearWish" style={{ ...getStyle("/NewYearWish"), color: '#ff4d6d' }}><GiftOutlined style={{ fontSize: 22 }} /><b>惊喜</b></Link>
      <Link to="/messageboard" style={getStyle("/messageboard")}><MessageOutlined style={{ fontSize: 18 }} /><span>留言板</span></Link>
      <Link to="/toy/WeChatWindow" style={getStyle("/WeChatWindow")}><WechatOutlined style={{ fontSize: 18 }} /><span>聊天</span></Link>
    </div>
  );
};

// --- 核心组件逻辑：包含导航、权限和所有路由 ---
function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 获取登录状态和用户信息
  const userInfoRaw = localStorage.getItem('userInfo');
  const userInfo = userInfoRaw && userInfoRaw !== "undefined" ? JSON.parse(userInfoRaw) : {};
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    message.success('退出成功，记得常回来找我玩');
    navigate('/login');
  };

  // 统一的菜单渲染函数 (整合了退出登录和管理员逻辑)
  const renderMenuItems = (onItemClick = () => { }) => (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ borderRight: 0, background: 'transparent' }}
      onClick={onItemClick}
    >
      <Menu.Item key="welcome" icon={<HomeOutlined />}><Link to="/">首页</Link></Menu.Item>

      <SubMenu key="worldcup" icon={<TableOutlined />} title="🏆 世界杯管理">
        <Menu.Item key="TeamManagement"><Link to="/TeamManagement">球队信息</Link></Menu.Item>
        <Menu.Item key="WorldCupGroups"><Link to="/WorldCupGroups">分组概览</Link></Menu.Item>
        <Menu.Item key="MatchManagement"><Link to="/MatchManagement">赛程管理</Link></Menu.Item>
      </SubMenu>

      <SubMenu key="game" icon={<AppstoreOutlined />} title="🎮 游戏娱乐">
        <Menu.Item key="snake"><Link to="/game/snake">贪吃蛇</Link></Menu.Item>
        <Menu.Item key="mole"><Link to="/game/mole">打地鼠</Link></Menu.Item>
        <Menu.Item key="Gomoku"><Link to="/game/Gomoku">五子棋</Link></Menu.Item>
        <Menu.Item key="BreakoutGame"><Link to="/game/BreakoutGame">打砖块</Link></Menu.Item>
        <Menu.Item key="CustomStrategyGame"><Link to="/game/CustomStrategyGame">自创棋</Link></Menu.Item>
        <Menu.Item key="TerrainRPSGame"><Link to="/game/TerrainRPSGame">自创棋2</Link></Menu.Item>
      </SubMenu>

      <SubMenu key="luck" icon={<AimOutlined />} title="🎲 运气/策略">
        <Menu.Item key="rockpaperscissors"><Link to="/rockpaperscissors">石头剪刀布</Link></Menu.Item>
        <Menu.Item key="CaptiveChessGame"><Link to="/CaptiveChessGame">俘虏棋（仅适配电脑端）</Link></Menu.Item>
        <Menu.Item key="dice2"><Link to="/dice2">掷骰子</Link></Menu.Item>
      </SubMenu>

      <SubMenu key="tools" icon={<SettingOutlined />} title="🛠️ 工具">
        <Menu.Item key="Elevator" icon={<RocketOutlined />}><Link to="/Elevator">电梯模拟（仅适配电脑端）</Link></Menu.Item>
        <Menu.Item key="Subway" icon={<CoffeeOutlined />}><Link to="/Subway">地铁系统（仅适配电脑端）</Link></Menu.Item>
        {/* 仅管理员可见 */}
        {userInfo.role === 'admin' && <Menu.Item key="user" icon={<UserOutlined />}><Link to="/user">用户管理</Link></Menu.Item>}
        {userInfo.role === 'admin' && <Menu.Item key="file" icon={<SettingOutlined />}><Link to="/file">文件管理</Link></Menu.Item>}
      </SubMenu>

      <Menu.Item key="album" icon={<PictureOutlined />}><Link to="/album">相册回忆</Link></Menu.Item>
      <Menu.Item key="messageboard" icon={<MessageOutlined />}><Link to="/messageboard">留言板</Link></Menu.Item>
      <Menu.Item key="NewYearWish" icon={<GiftOutlined />}><Link to="/NewYearWish">惊喜</Link></Menu.Item>
      <Menu.Item key="WeChatWindow" icon={<WechatOutlined />}><Link to="/toy/WeChatWindow">聊天</Link></Menu.Item>
      <Menu.Item key="VirtualShop" icon={<ShoppingCartOutlined />}><Link to="/toy/VirtualShop">商店</Link></Menu.Item>
      <Menu.Item key="AIChat" icon={<ShoppingCartOutlined />}><Link to="/AIChat">文字冒险游戏</Link></Menu.Item>
      {token && (
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: '#ff4d6d' }}>
          退出登录
        </Menu.Item>
      )}
    </Menu>
  );

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      {/* 电脑端：侧边栏 */}
      {!isMobile && (
        <Sider
          theme="light" collapsible collapsed={collapsed} onCollapse={setCollapsed}
          style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 1000, background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}
        >
          <div style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: '18px' }}>{collapsed ? '🎁' : '✨ 你好世界'}</span>
            {!collapsed && token && (
              <span style={{ fontSize: '10px', color: '#ff4d6d' }}>园丁: {userInfo.username}</span>
            )}
          </div>
          {renderMenuItems()}
        </Sider>
      )}

      {/* 手机端：抽屉 */}
      <Drawer
        title={`你好，${userInfo.username || '游客'}`}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width="75%"
        styles={{ body: { padding: '8px 0' } }}
      >
        {renderMenuItems(() => setDrawerOpen(false))}
      </Drawer>

      <div style={{ display: 'none' }}><Sider breakpoint="lg" onBreakpoint={setIsMobile} /></div>

      <Layout style={{
        background: "transparent", transition: 'all 0.2s ease',
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200),
        paddingBottom: isMobile ? '80px' : '0px'
      }}>
        <Content style={{ padding: isMobile ? '12px' : '24px', minHeight: "100vh" }}>
          <Routes>
            {/* 公开页面 */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/yala" element={<Yala />} />
            <Route path="/NewYearWish" element={<NewYearWish />} />
            <Route path="/WorldCupGroups" element={<WorldCupGroups />} />
            <Route path="/game/snake" element={<SnakeGame />} />
            <Route path="/game/TerrainRPSGame" element={<TerrainRPSGame />} />
            <Route path="/game/mole" element={<Mole />} />
            <Route path="/game/Gomoku" element={<Gomoku />} />
            <Route path="/game/BreakoutGame" element={<BreakoutGame />} />
            <Route path="/game/CustomStrategyGame" element={<CustomStrategyGame />} />
            <Route path="/CaptiveChessGame" element={<CaptiveChessGame />} />
            <Route path="/toy/WeChatWindow" element={<WeChatWindow />} />
            <Route path="/rockpaperscissors" element={<RockPaperScissors />} />
            <Route path="/dice2" element={<DiceGame />} />
            <Route path="/Elevator" element={<ElevatorSimulation />} />
            <Route path="/Subway" element={<SubwaySimulation />} />
            <Route path="/AIChat" element={<AIChat />} />
            {/* 🔒 需要登录的页面 (全部套上守卫) */}
            <Route path="/TeamManagement" element={<PrivateRoute><TeamManagement /></PrivateRoute>} />
            <Route path="/MatchManagement" element={<PrivateRoute><MatchManagement /></PrivateRoute>} />
            <Route path="/toy/VirtualShop" element={<PrivateRoute><VirtualShop /></PrivateRoute>} />
            <Route path="/messageboard" element={<PrivateRoute><MessageBoard /></PrivateRoute>} />
            <Route path="/album" element={<PrivateRoute><PhotoAlbum /></PrivateRoute>} />
            <Route path="/user" element={<PrivateRoute><UserTable /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Content>
      </Layout>

      {isMobile && <MobileTabBar />}
      {isMobile && (
        <FloatButton
          icon={<AppstoreOutlined />}
          type="primary"
          style={{ right: 20, bottom: 90, width: 48, height: 48 }}
          onClick={() => setDrawerOpen(true)}
          tooltip="更多应用"
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider theme={{
      token: { colorPrimary: '#ff4d6d', borderRadius: 12 },
    }}>
      <ParticleBackground />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  );
}