import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Modal, message, Avatar, Empty, InputNumber, Popconfirm } from 'antd';
import { UserOutlined, SendOutlined, GiftOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { service } from '../utils/request';
import BalanceCard from './BalanceCard';
import confetti from 'canvas-confetti';

const WeChatWindow = () => {
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [inputValue, setInputValue] = useState('');
  const [isRedModalOpen, setIsRedModalOpen] = useState(false);
  const [redAmount, setRedAmount] = useState(1.00);
  
  // 📱 手机端适配状态
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const scrollRef = useRef(null);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. 初始化获取用户列表
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await service.get('/api/users/all');
        if (Array.isArray(data)) {
          setUsers(data.filter(u => u.id !== userInfo.id));
        }
      } catch (e) {
        console.error("加载用户列表失败", e);
      }
    };
    fetchUsers();
  }, [userInfo.id]);

  // 2. 定时获取聊天记录（包含红包领取状态）
  const fetchChat = async () => {
    if (!selectedUser) return;
    try {
      const data = await service.get(`/api/chat/history/${selectedUser.id}`);
      setMessages(data);
    } catch (e) {
      console.error("获取聊天记录失败", e);
    }
  };

  useEffect(() => {
    fetchChat();
    const timer = setInterval(fetchChat, 3000); // 3秒轮询
    return () => clearInterval(timer);
  }, [selectedUser]);

  // 3. 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- 功能交互函数 ---

  // 清空聊天记录
  const handleClearChat = async () => {
    if (!selectedUser) return;
    try {
      await service.delete(`/api/chat/clear/${selectedUser.id}`);
      message.success("聊天记录已清空");
      setMessages([]);
    } catch (e) {
      message.error("清空失败");
    }
  };

  // 发送普通消息
  const handleSend = async () => {
    if (!inputValue.trim() || !selectedUser) return;
    try {
      await service.post('/api/chat/send', {
        content: inputValue,
        receiver_id: selectedUser.id
      });
      setInputValue('');
      fetchChat();
    } catch (e) {
      message.error("发送失败");
    }
  };

  // 发送红包
  const handleSendRedPacket = async () => {
    if (redAmount <= 0) return;
    try {
      // 后端逻辑：扣钱 -> 存记录 -> 发消息
      await service.post('/api/chat/send_red_packet', {
        amount: redAmount,
        receiver_id: selectedUser.id
      });
      setIsRedModalOpen(false);
      message.success("红包已发出，余额已扣除 🧧");
      fetchChat(); 
    } catch (e) {
      message.error(e.response?.data?.message || "发送失败");
    }
  };

  // 领取红包
  const handleOpenRedPacket = async (msg, packetId, amount) => {
    // 自己发的或者已领取的不能点
    if (msg.isMe || msg.isClaimed) return; 
    
    try {
      await service.post('/api/user/collect_red_packet', { packet_id: packetId });
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d4f', '#ffcc00']
      });
      
      message.success(`恭喜！你领取了 ${amount} 元红包！`);
      fetchChat(); // 立即刷新状态
    } catch (e) {
      message.warning(e.response?.data?.message || "领取失败");
    }
  };

  // --- 视图渲染函数 ---

  // 渲染左侧/列表页
  const renderUserList = () => (
    <div style={{ 
      width: isMobile ? '100%' : '280px', 
      background: '#fff', 
      display: (isMobile && selectedUser) ? 'none' : 'flex', 
      flexDirection: 'column', 
      height: '100%',
      borderRight: '1px solid #f0f0f0'
    }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #f9f9f9' }}>
          <BalanceCard /> 
          <h3 style={{ margin: '10px 0 0 5px', color: '#333' }}>联系人列表</h3>
      </div>
      <List
        style={{ flex: 1, overflowY: 'auto' }}
        dataSource={users}
        renderItem={item => (
          <List.Item
            onClick={() => setSelectedUser(item)}
            style={{
              padding: '12px 15px',
              cursor: 'pointer',
              background: selectedUser?.id === item.id ? '#fff0f2' : 'transparent',
              borderLeft: selectedUser?.id === item.id ? '4px solid #ff4d6d' : '4px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ffc1cc' }} />}
              title={<span style={{ fontWeight: selectedUser?.id === item.id ? 'bold' : 'normal' }}>{item.username}</span>}
              description={item.role === 'admin' ? '管理员' : '小伙伴'}
            />
          </List.Item>
        )}
      />
    </div>
  );

  // 渲染右侧/聊天页
  const renderChatWindow = () => (
    <div style={{ 
      flex: 1, 
      display: (isMobile && !selectedUser) ? 'none' : 'flex', 
      flexDirection: 'column', 
      background: '#f9f9f9',
      height: '100%'
    }}>
      {selectedUser ? (
        <>
          {/* 聊天头部 */}
          <div style={{ 
            padding: '12px 15px', 
            background: '#fff', 
            borderBottom: '1px solid #eee', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isMobile && (
                <ArrowLeftOutlined 
                  onClick={() => setSelectedUser(null)} 
                  style={{ fontSize: '18px', color: '#ff4d6d', padding: '5px' }} 
                />
              )}
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selectedUser.username}</span>
            </div>
            <Popconfirm title="要清空这段聊天记录吗？" onConfirm={handleClearChat} okText="清空" cancelText="取消">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>

          {/* 聊天内容区 */}
          <div 
            ref={scrollRef} 
            style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            {messages.map((msg, index) => {
              const isRed = msg.content && msg.content.startsWith('[RED_PACKET:');
              const parts = isRed ? msg.content.replace('[RED_PACKET:', '').replace(']', '').split(':') : [];
              const displayAmount = parts[0];
              const packetId = parts[1];
              const isClaimed = msg.isClaimed; // 后端返回的实时状态

              return (
                <div key={index} style={{ 
                  alignSelf: msg.isMe ? 'flex-end' : 'flex-start', 
                  maxWidth: isMobile ? '90%' : '75%', 
                  display: 'flex', 
                  flexDirection: msg.isMe ? 'row-reverse' : 'row', 
                  gap: '10px' 
                }}>
                  <Avatar size={isMobile ? "small" : "default"} icon={<UserOutlined />} />
                  
                  {isRed ? (
                    // --- 红包 UI 渲染 ---
                    <div 
                      onClick={() => handleOpenRedPacket(msg, packetId, displayAmount)}
                      style={{
                        width: '210px',
                        background: isClaimed ? '#fcd0a1' : '#fa9d3b',
                        borderRadius: '8px',
                        cursor: (msg.isMe || isClaimed) ? 'default' : 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        opacity: isClaimed ? 0.7 : 1,
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                        <div style={{ background: isClaimed ? '#eee' : '#fff', borderRadius: '4px', padding: '4px' }}>
                           <GiftOutlined style={{ color: isClaimed ? '#ccc' : '#fa9d3b', fontSize: '24px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px' }}>
                            {isClaimed ? '红包已被领取' : '恭喜发财，大吉大利'}
                          </div>
                          <div style={{ fontSize: '12px', opacity: 0.9 }}>¥{displayAmount}</div>
                        </div>
                      </div>
                      <div style={{ background: '#fff', padding: '4px 12px', fontSize: '11px', color: '#999', borderRadius: '0 0 8px 8px' }}>
                        {isClaimed ? '红包已拆开' : (msg.isMe ? '发出的红包' : '点击领取红包')}
                      </div>
                    </div>
                  ) : (
                    // --- 普通消息 UI 渲染 ---
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: msg.isMe ? '#ff4d6d' : '#fff',
                      color: msg.isMe ? '#fff' : '#333',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontSize: '15px',
                      wordBreak: 'break-all'
                    }}>
                      {msg.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 输入控制区 */}
          <div style={{ 
            padding: isMobile ? '10px' : '20px', 
            background: '#fff', 
            borderTop: '1px solid #eee', 
            display: 'flex', 
            gap: '10px',
            alignItems: 'center'
          }}>
            <Button 
              shape="circle" 
              icon={<GiftOutlined />} 
              onClick={() => setIsRedModalOpen(true)}
              style={{ color: '#ff4d4f', borderColor: '#ff4d4f', flexShrink: 0 }}
            />
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              placeholder="输入消息..."
              size={isMobile ? "default" : "large"}
              style={{ borderRadius: '20px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              size={isMobile ? "default" : "large"}
              style={{ background: '#ff4d6d', border: 'none', borderRadius: '20px', flexShrink: 0 }}
            >
              {!isMobile && '发送'}
            </Button>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
          <Empty description="选一个好友，开始私聊吧~" />
        </div>
      )}
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      height: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 120px)', 
      background: '#fff', 
      margin: isMobile ? '0' : '20px',
      borderRadius: isMobile ? '0' : '12px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      {renderUserList()}
      {renderChatWindow()}

      {/* 发红包模态框 */}
      <Modal
        title="🧧 发送红包"
        open={isRedModalOpen}
        onOk={handleSendRedPacket}
        onCancel={() => setIsRedModalOpen(false)}
        okText="塞进红包"
        cancelText="取消"
        centered
        okButtonProps={{ danger: true, type: 'primary', style: { borderRadius: '20px' } }}
        cancelButtonProps={{ style: { borderRadius: '20px' } }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '15px' }}>红包金额</div>
          <InputNumber
            min={0.01}
            precision={2}
            value={redAmount}
            onChange={setRedAmount}
            size="large"
            prefix="￥"
            style={{ width: '200px', fontSize: '24px' }}
          />
          <p style={{ color: '#ff4d6d', marginTop: '10px', fontSize: '12px' }}>
            发出的金额将直接从你的账户余额扣除
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default WeChatWindow;