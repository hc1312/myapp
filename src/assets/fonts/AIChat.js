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
  { label: '创业尝试', value: '创业尝试', icon: '📈' }
];

// 解析 AI 回复：提取剧情、选项和状态 JSON
const parseContent = (text) => {
  // 移除思考过程
  const clean = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // 1. 提取状态 JSON
  let newStats = null;
  const statsMatch = clean.match(/<stats>([\s\S]*?)<\/stats>/);
  if (statsMatch) {
    try {
      newStats = JSON.parse(statsMatch[1].trim());
    } catch (e) {
      console.error("解析状态失败", e);
    }
  }

  // 2. 提取选项
  const optionRegex = /\[选项\d\]\s*(.+)/g;
  const options = [];
  let match;
  while ((match = optionRegex.exec(clean)) !== null) {
    options.push(match[1].trim());
  }

  // 3. 提取纯剧情叙述（移除标签和选项行）
  const narrative = clean
    .replace(/<stats>[\s\S]*?<\/stats>/g, '')
    .replace(/\[选项\d\].*/g, '')
    .trim();

  return { narrative, options, newStats };
};

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [gameTheme, setGameTheme] = useState(null);
  const [stats, setStats] = useState({ money: 100, thirst: 50, hunger: 50 });
  const listRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const callAI = async (actionText) => {
    setLoading(true);
    // 乐观 UI 更新：先将用户输入显示在对话框
    const userMsg = { role: 'user', content: actionText, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1',
          messages: [
            {
              role: 'system',
              content: `你是一名文字冒险游戏DM。风格写实，节奏缓慢。
              当前状态：金钱=${stats.money}, 口渴度=${stats.thirst}, 饥饿值=${stats.hunger}。
              【严格遵守格式要求】
              你的回复必须包含且仅包含以下三个部分：
              1. 剧情叙述：描述玩家行动后的结果。
              2. 状态标签：必须输出以下格式，严禁修改键名，确保是标准JSON：
              <stats>{"money": 100, "thirst": 50, "hunger": 50}</stats>
              3. 选项列表：[选项1] xxx ...`
            },
            ...messages.slice(-6), // 保留最近3轮对话
            userMsg
          ],
          stream: false
        })
      });

      const data = await response.json();
      const { narrative, options: parsedOptions, newStats } = parseContent(data.message.content);

      // 更新 AI 剧情
      setMessages(prev => [...prev, { role: 'assistant', content: narrative, id: Date.now() + 1 }]);

      // 更新状态和选项
      if (newStats) setStats(newStats);
      setOptions(parsedOptions.length > 0 ? parsedOptions : ['继续前行']);

    } catch (e) {
      message.error('连接 AI 失败，请检查网络或 Ollama 状态');
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
      <div className="status-bar">
        <div className="stat-pill">💰 余额 {stats.money}</div>
        <div className="stat-pill">🥤 水分 {stats.thirst}</div>
        <div className="stat-pill">🍔 能量 {stats.hunger}</div>
      </div>

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