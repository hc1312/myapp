import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Typography, Spin, Input, FloatButton, message } from 'antd';
import { SendOutlined, ReloadOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';

const { Title, Text } = Typography;

const themes = [
  { label: '都市人生', value: '普通城市生活', icon: '🏙️' },
  { label: '职场选择', value: '初入职场', icon: '💼' },
  { label: '校园时光', value: '大学与青春', icon: '🎓' },
  { label: '情感关系', value: '友情与爱情', icon: '❤️' },
  { label: '人生转折', value: '关键抉择', icon: '🔀' },
  { label: '家庭故事', value: '亲情与责任', icon: '🏠' },
  { label: '独自旅行', value: '陌生城市', icon: '🧳' },
  { label: '现实悬疑', value: '现实悬疑', icon: '🔍' },
  { label: '创业尝试', value: '创业尝试', icon: '📈' },
  { label: '沙漠探险', value: '沙漠探险', icon: '🏜' },
  { label: '模拟读研', value: '模拟读研', icon: '🎓' },
];

// 解析 AI 回复：仅提取剧情和选项
const parseContent = (text) => {
  // 移除思考过程
  const clean = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // 1. 提取选项
  const optionRegex = /\[选项\d\]\s*(.+)/g;
  const options = [];
  let match;
  while ((match = optionRegex.exec(clean)) !== null) {
    options.push(match[1].trim());
  }

  // 2. 提取纯剧情叙述（移除选项行）
  const narrative = clean
    .replace(/\[选项\d\].*/g, '')
    .trim();

  return { narrative, options };
};

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [gameTheme, setGameTheme] = useState(null);
  const listRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const callAI = async (actionText) => {
    if (!actionText || loading) return;

    setLoading(true);
    const userMsg = { role: 'user', content: actionText, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer e4b94444-370b-40e4-a2cb-46b248bfe5be` 
        },
        body: JSON.stringify({
          model: 'doubao-seed-1-8-251228', 
          messages: [
            {
              role: 'system',
              content: `你是一名文字冒险游戏DM。风格写实，笔触细腻，节奏缓慢。
              【回复要求】
              你的回复必须包含以下两个部分：
              剧情叙述：描述玩家行动后的结果，注重心理描写和环境渲染。
              选项列表：提供4个的后续选项，格式为：[选项1] 内容...`
            },
            ...messages.slice(-6).map(({ role, content }) => ({ role, content })),
            { role: 'user', content: actionText }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.error?.message || 'API 请求失败');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      const { narrative, options: parsedOptions } = parseContent(aiResponse);

      setMessages(prev => [...prev, { role: 'assistant', content: narrative, id: Date.now() + 1 }]);
      setOptions(parsedOptions.length > 0 ? parsedOptions : ['继续前行']);

    } catch (e) {
      message.error(`连接失败: ${e.message}`);
      console.error("API Error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!gameTheme) {
    return (
      <div className="theme-selection-page">
        <div className="glass-header">
          <Title level={2}>人生模拟器</Title>
          <Text secondary>你的每一个选择，都在书写属于自己的剧本</Text>
        </div>
        <div className="theme-grid">
          {themes.map(t => (
            <div key={t.label} className="theme-item" onClick={() => {
              setGameTheme(t.label);
              callAI(`开始游戏，主题是「${t.value}」`);
            }}>
              <div className="theme-icon">{t.icon}</div>
              <div className="theme-label">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* 状态栏已移除 */}
      <div className="game-main" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`message-row ${m.role === 'user' ? 'row-user' : 'row-ai'}`}>
            <Card className={`story-card ${m.role === 'user' ? 'card-user' : 'card-ai'}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </Card>
          </div>
        ))}
        {loading && <Spin size="large" className="loading-spin" tip="命运编织中..." />}
      </div>

      <div className="decision-panel">
        <div className="options-container">
          {!loading && options.map((opt, i) => (
            <Button key={i} className="decision-btn" onClick={() => callAI(opt)}>
              {opt}
            </Button>
          ))}
        </div>
        <Input.Search
          placeholder="或者输入你的抉择..."
          onSearch={callAI}
          enterButton={<SendOutlined />}
          disabled={loading}
        />
      </div>

      <FloatButton icon={<ReloadOutlined />} onClick={() => window.location.reload()} />
    </div>
  );
};

export default AIChat;