import React from 'react';
import { Typography, Card, Layout, Row, Col } from 'antd';
import { 
  SmileOutlined, 
  GlobalOutlined, 
  CodeOutlined, 
  PlayCircleOutlined, 
  BorderOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const WelcomePage = () => {
  const navigate = useNavigate();

  // 定义跳转函数
  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Content style={{ 
      padding: '24px', 
      background: 'transparent', // 保持透明以显示 ParticleBackground
      minHeight: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <Card style={{ 
        textAlign: 'center', 
        padding: '40px 20px', 
        borderRadius: 20, 
        maxWidth: 1000, 
        width: '100%',
        background: 'rgba(255, 255, 255, 0.85)', // 半透明质感
        backdropFilter: 'blur(10px)', // 毛玻璃效果
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: 'none'
      }}>
        <SmileOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
        <Title level={1} style={{ marginTop: 20, fontSize: 'clamp(24px, 5vw, 38px)' }}>
          欢迎使用你好世界！
        </Title>
        <Text type="secondary">请点击下方卡片开始探索应用功能</Text>

        {/* --- 管理功能区 --- */}
        <Row gutter={[24, 24]} style={{ marginTop: 40 }} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><GlobalOutlined /> 世界杯管理</>}
              hoverable
              className="mobile-hover-card"
              onClick={() => handleCardClick('/WorldCupGroups')}
            >
              <Text>查看 2026 世界杯的球队分组概览，掌握一手赛事资讯。</Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><CodeOutlined /> 文件及用户</>}
              hoverable
              className="mobile-hover-card"
              onClick={() => handleCardClick('/file')}
            >
              <Text>管理文件上传、下载，以及查看系统用户信息。</Text>
            </Card>
          </Col>
        </Row>

        <Title level={3} style={{ 
          marginTop: 50, 
          borderBottom: '1px solid #eee', 
          paddingBottom: 15,
          marginBottom: 30 
        }}>
          🎮 游戏快速入口
        </Title>

        {/* --- 游戏功能区 --- */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><PlayCircleOutlined /> 自创棋</>}
              hoverable
              className="mobile-hover-card"
              onClick={() => handleCardClick('/game/CustomStrategyGame')}
            >
              <Text>尝试自定义规则的策略棋类游戏，挑战你的智力。</Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              title={<><BorderOutlined /> 五子棋</>}
              hoverable
              className="mobile-hover-card"
              onClick={() => handleCardClick('/game/Gomoku')}
            >
              <Text>经典的五子连珠，随时随地来一局博弈。</Text>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 60, opacity: 0.7 }}>
          <Text type="success">💡 也可以通过左侧导航栏快速切换功能哦！</Text>
        </div>

        {/* 专门针对移动端交互的微调 CSS */}
        <style>{`
          .mobile-hover-card {
            height: 100%;
            border-radius: 15px !important;
            transition: all 0.3s ease !important;
          }
          .mobile-hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
          }
          .mobile-hover-card:active {
            transform: scale(0.95); /* 手机按下时的缩放效果 */
          }
          @media (max-width: 576px) {
            .ant-typography h1 { font-size: 28px !important; }
            .ant-card-body { padding: 15px !important; }
          }
        `}</style>
      </Card>
    </Content>
  );
};

export default WelcomePage;