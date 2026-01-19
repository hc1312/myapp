import React, { useState, useEffect } from 'react';
import { Input, Button, message, Popconfirm, Empty, Spin } from 'antd';
import { HeartOutlined, HeartFilled, SendOutlined, DeleteOutlined, PushpinOutlined } from '@ant-design/icons';
import { getMessages, addMessage, delMessage, likeMessage } from './utils/request';

const { TextArea } = Input;

const MessageBoard = () => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  // 调整便签颜色，使其在深色木纹上更亮眼
  const colors = ['#fff9c4', '#ffecb3', '#e1f5fe', '#f3e5f5', '#f1f8e9', '#fff3e0'];

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessages();
      setMessages(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) return message.warning('写点什么再发送吧~');
    try {
      await addMessage(content);
      setContent('');
      fetchMessages();
      message.success('留言成功！');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (uuid) => {
    try {
      await likeMessage(uuid);
      fetchMessages();
    } catch (error) {
      console.error("点赞失败", error);
    }
  };

  const handleDelete = async (uuid) => {
    try {
      await delMessage(uuid);
      message.success('留言已撕掉~');
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="message-board-container">
      <style>{`
        @font-face { font-family: 'FlyCloud'; src: url('./assets/fonts/云峰飞云体.ttf') format('truetype'); }
        @font-face { font-family: 'FloatingLife'; src: url('./assets/fonts/张穸洛浮生楷体.ttf') format('truetype'); }
        @font-face { font-family: 'LoveLetter'; src: url('./assets/fonts/张穸洛情书体.ttf') format('truetype'); }
        @font-face { font-family: 'YozaiLocal'; src: url('./assets/fonts/slideyouran-Regular.ttf') format('truetype'); }
      `}</style>

      <div className="message-board-inner">
        <h2 className="board-title">📜 留言板 📜</h2>

        <div className="input-section">
          <TextArea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在木板上刻下你的心情..."
            className="custom-textarea"
          />
          <div style={{ textAlign: 'right', marginTop: '12px' }}>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} shape="round" className="send-btn">
              钉上去
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          {messages.length === 0 ? <Empty description="木板上空空的，快来留言吧" /> : (
            <div className="waterfall-layout">
              {messages.map((msg, index) => {
                const canDelete = userInfo.role === 'admin' || msg.user_id === userInfo.id;
                const fontPool = ['FlyCloud', 'FloatingLife', 'LoveLetter', 'YozaiLocal'];
                const selectedFont = fontPool[index % fontPool.length];
                const rotateDeg = (index % 2 === 0 ? 1 : -1) * (Math.random() * 3 + 1);

                return (
                  <div key={msg.uuid} className="waterfall-item">
                    <div
                      className="sticky-note"
                      style={{
                        background: colors[index % colors.length],
                        transform: `rotate(${rotateDeg}deg)`,
                        fontFamily: selectedFont
                      }}
                    >
                      {index % 3 === 0 ? <div className="tape-deco" /> : <PushpinOutlined className="pin-deco" />}

                      <div className="note-content">{msg.content}</div>

                      <div className="note-footer">
                        {/* 醒目的日期标签 */}
                        <span className="note-time-tag">{msg.create_time?.split(' ')[0]}</span>

                        <div className="actions">
                          <div className={`like-wrapper ${msg.likes > 0 ? 'is-liked' : ''}`} onClick={() => handleLike(msg.uuid)}>
                            <div className="heart-icon">
                              {msg.likes > 0 ? <HeartFilled /> : <HeartOutlined />}
                            </div>
                            {/* 点赞数也使用楷体 */}
                            <span className="like-count">{msg.likes || 0}</span>
                          </div>

                          {canDelete && (
                            <Popconfirm title="确定要撕掉吗？" onConfirm={() => handleDelete(msg.uuid)} okText="确定" cancelText="取消">
                              <DeleteOutlined className="delete-icon" />
                            </Popconfirm>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Spin>
      </div>

      <style>{`
        /* 1. 木质背景优化 */
        .message-board-container {
          min-height: 100vh;
          padding: 40px 20px;
          /* 使用线性渐变模拟木纹质感 */
          background-color: #5d4037;
          background-image: 
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,.03) 50px, rgba(0,0,0,.03) 100px),
            linear-gradient(to bottom, #8d6e63, #5d4037);
          box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
        }
        .note-time-tag {
          font-family: 'FloatingLife', 'STKaiti', serif; /* 强制使用楷体 */
          font-size: 13px;
          color: #6d4c41; /* 深棕色，呼应木质背景 */
          background: rgba(255, 255, 255, 0.5); /* 半透明底色 */
          padding: 2px 10px;
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        .message-board-inner { max-width: 1200px; margin: 0 auto; }
        .board-title { 
            text-align: center; margin-bottom: 40px; color: #fff; font-size: 32px; font-weight: bold; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        /* 输入框半透明处理，融入背景 */
        .input-section {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(5px);
          padding: 20px; border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          max-width: 600px; margin: 0 auto 50px auto;
        }

        .waterfall-layout { column-count: 4; column-gap: 25px; }
        .waterfall-item { break-inside: avoid; margin-bottom: 30px; }

        /* 2. 便签阴影增强，模拟悬浮感 */
        .sticky-note {
          padding: 30px 18px 12px 18px;
          position: relative;
          box-shadow: 5px 5px 15px rgba(0,0,0,0.3);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-bottom-right-radius: 40px 10px;
        }

        .sticky-note:hover {
          transform: scale(1.05) rotate(0deg) !important;
          z-index: 10;
          box-shadow: 15px 20px 35px rgba(0,0,0,0.4);
        }

        .note-content { font-size: 19px; line-height: 1.6; color: #392727ff; margin-bottom: 15px; min-height: 60px; }
        .note-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 10px; }
        .note-time { font-size: 11px; color: #888; }
        /* 调整底部布局间距 */
        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px dashed rgba(0,0,0,0.1);
          padding-top: 12px;
          margin-top: 5px;
        }

        /* 点赞激活后的数字颜色 */
        .is-liked .like-count {
          color: #ff4d6d;
          text-shadow: 0 0 2px rgba(255, 77, 109, 0.2);
        }
        /* 3. 优化点赞标志交互 */
        .like-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 12px;
          transition: background 0.2s;
          user-select: none;
        }
        
        .like-wrapper:hover { background: rgba(255, 77, 109, 0.1); }
        .like-wrapper:active .heart-icon { transform: scale(1.4); }

        .heart-icon {
          display: flex;
          align-items: center;
          transition: transform 0.2s;
          font-size: 16px;
          color: #bfbfbf;
        }

        .is-liked .heart-icon { color: #ff4d6d; animation: beat 0.3s ease; }
        .is-liked .like-count { color: #ff4d6d; font-weight: bold; }
        .like-count { font-size: 13px; color: #666; }

        @keyframes beat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        /* 2. 点赞数数字样式 */
        .like-count {
          font-family: 'FloatingLife', 'STKaiti', serif; /* 强制使用楷体 */
          font-size: 15px; /* 稍微调大一点 */
          color: #666;
          margin-left: 2px;
        }
        /* 装饰物 */
        .pin-deco { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); color: #d32f2f; font-size: 22px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3)); }
        .tape-deco {
          position: absolute; top: -15px; left: 50%; transform: translateX(-50%) rotate(-2deg);
          width: 80px; height: 26px;
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(2px);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        }

        .delete-icon { color: #888; cursor: pointer; margin-left: 10px; transition: color 0.3s; }
        .delete-icon:hover { color: #ff4d4f; }

        @media (max-width: 1200px) { .waterfall-layout { column-count: 3; } }
        @media (max-width: 992px) { .waterfall-layout { column-count: 2; } }
        @media (max-width: 500px) { .waterfall-layout { column-count: 1; } }
      `}</style>
    </div>
  );
};

export default MessageBoard;