import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, message, Tag, Result, Modal, Statistic, Row, Col } from 'antd';
import { 
  StarFilled, 
  HeartFilled, 
  GoldFilled, 
  UserOutlined, 
  WalletOutlined,
  ThunderboltOutlined 
} from '@ant-design/icons';
import confetti from 'canvas-confetti';
import { service } from '../utils/request';

const { Title, Text } = Typography;

const NewYearWish = () => {
  const [savedWish, setSavedWish] = useState(null);
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  // 1. 初始化检查状态 & 播放开场礼花
  useEffect(() => {
    if (userInfo) fetchStatus();
    
    // 开场气氛组：随机撒花
    const end = Date.now() + (2 * 1000);
    const colors = ['#ff4d4f', '#ffda08', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await service.get('/api/user/get_wish');
      setSavedWish(res.wish);
    } catch (e) {
      console.error("获取愿望状态失败", e);
    }
  };

  // 2. 许愿逻辑
  const handleWish = async (type) => {
    setLoading(true);
    try {
      const res = await service.post('/api/user/make_wish', { wish: type });
      
      // 成功后设置状态
      setSavedWish(type);

      // 💥 震撼的红包弹窗
      Modal.success({
        title: '🎊 2026 鸿运当头！',
        width: 400,
        centered: true,
        okText: '领奖并开启新篇章',
        maskClosable: false,
        content: (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <Text type="secondary">您许下的愿望是</Text>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cf1322', marginTop: '5px' }}>
                【{type}】
              </div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)', 
              padding: '30px 20px', 
              borderRadius: '15px',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(255, 77, 79, 0.3)'
            }}>
              <Statistic 
                title={<span style={{ color: '#ffccc7' }}>新年第一桶金</span>}
                value={res.bonus} 
                precision={2}
                prefix={<WalletOutlined />} 
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              />
              <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>
                金额已直接存入您的账户余额
              </div>
            </div>
          </div>
        ),
      });

      // 全屏大礼花效果
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
      }, 250);

    } catch (e) {
      message.error(e.response?.data?.message || '许愿失败');
    } finally {
      setLoading(false);
    }
  };

  // 配置愿望卡片样式
  const wishConfigs = {
    '财源广进': { color: '#faad14', icon: <GoldFilled />, desc: '2026 钱袋满满，财运滚滚' },
    '爱情美满': { color: '#ff4d6d', icon: <HeartFilled />, desc: '2026 遇到真爱，幸福甜蜜' },
    '身体健康': { color: '#52c41a', icon: <StarFilled />, desc: '2026 活力四射，百病不侵' }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #1a1a1a 0%, #430c0c 100%)', // 酷炫深红暗色背景
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '20px' 
    }}>
      <Card 
        bordered={false}
        style={{ 
          maxWidth: 500, 
          width: '100%', 
          textAlign: 'center', 
          borderRadius: '24px', 
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}
      >
        {/* 卡片顶部的节日装饰条 */}
        <div style={{ height: '6px', background: 'linear-gradient(90deg, #faad14, #ff4d6f, #faad14)' }} />
        
        <div style={{ padding: '30px 20px' }}>
          <Title level={2} style={{ color: '#cf1322', marginBottom: '8px' }}>
            <ThunderboltOutlined /> 2026 新年祈愿
          </Title>
          <Text type="secondary">新年的钟声响彻星空，请许下您唯一的祈愿</Text>

          {!userInfo ? (
            <div style={{ marginTop: '40px' }}>
              <Result
                status="info"
                title="尚未开启入口"
                subTitle="请先登录您的账户，方可领取 2026 年第一份好运。"
                extra={
                  <Button type="primary" danger size="large" href="/login" icon={<UserOutlined />} style={{ borderRadius: '20px', padding: '0 40px' }}>
                    立即登录
                  </Button>
                }
              />
            </div>
          ) : savedWish ? (
            <div style={{ padding: '40px 0' }}>
              <Text strong style={{ color: '#8c8c8c' }}>您已成功锁定 2026 年运势：</Text>
              <div style={{ marginTop: '20px' }}>
                <Tag color={wishConfigs[savedWish].color} style={{ fontSize: '28px', padding: '15px 30px', borderRadius: '15px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  {wishConfigs[savedWish].icon} {savedWish}
                </Tag>
              </div>
              <p style={{ marginTop: '20px', color: '#595959', fontStyle: 'italic' }}>
                "{wishConfigs[savedWish].desc}"
              </p>
              <div style={{ marginTop: '40px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>愿望已寄往银河系中心，2026 必将如你所愿</Text>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '30px' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  {Object.keys(wishConfigs).map(key => (
                    <Col span={24} key={key}>
                      <Button 
                        size="large" 
                        block 
                        loading={loading}
                        onClick={() => handleWish(key)}
                        style={{ 
                          height: '70px', 
                          borderRadius: '16px', 
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          border: `2px solid ${wishConfigs[key].color}`,
                          color: wishConfigs[key].color,
                          transition: 'all 0.3s'
                        }}
                        className="wish-button"
                      >
                        {wishConfigs[key].icon}
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '18px' }}>{key}</div>
                          <div style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.7 }}>{wishConfigs[key].desc}</div>
                        </div>
                      </Button>
                    </Col>
                  ))}
                </Row>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  * 注：每位用户仅有一次许愿机会，愿望一旦开启将获得 3~10w 随机启动金
                </Text>
              </Space>
            </div>
          )}
        </div>
      </Card>

      {/* 简单的 CSS 悬停效果 */}
      <style>{`
        .wish-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.1);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default NewYearWish;