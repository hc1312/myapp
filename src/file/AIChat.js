import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';
import { Document, Packer, Paragraph, TextRun } from "docx";


const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = 'e4b94444-370b-40e4-a2cb-46b248bfe5be'; // 建议放到后端
const MODEL_NAME = 'deepseek-v3-2-251201';

async function fetchAIResponse(messages) {
  const body = JSON.stringify({
    model: MODEL_NAME,
    messages: [
      { role: "system", content: "你是一个非常智能的人工智能助手，名叫璐璐，英语专业，很擅长帮助教培机构的老师给他们的学生家长写每日课堂反馈。当用户（也就是老师）想让你帮他写每日课堂反馈时，请你询问用户几个简单而核心的问题（包括但不限于孩子姓名、教学内容、课堂表现、题目情况等），得到回答后，开始写一个高质量、详细、非模板化的反馈。注意反馈要内容详细和充实，可以适当补充一些细节，也可以在小标题上使用emoji表情。" },
      ...messages.slice(-5)
    ],
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 请求失败: ${response.status} - ${errorData.message || '未知错误'}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "AI 没有返回内容";
  } catch (error) {
    console.error("调用 AI API 时发生错误:", error);
    return "抱歉，AI 服务出现故障，请稍后再试。";
  }
}

async function exportWord(messages) {
  const aiMessages = messages.filter(m => m.role === 'assistant');

  const doc = new Document({
    sections: [{
      properties: {},
      children: aiMessages.map(m =>
        new Paragraph({
          children: [
            new TextRun({ text: `AI 回复 (${m.timestamp})`, bold: true }),
            new TextRun({ text: "\n" }),
            new TextRun(m.content),
          ],
        })
      ),
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'AIChat.docx';
  link.click();
  URL.revokeObjectURL(url);
}

// 打字机效果
async function typeWriterEffect(text, callback) {
  for (let i = 0; i < text.length; i++) {
    callback(text.slice(0, i + 1));
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}


const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: inputValue.trim(), 
      key: Date.now() + '_u',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    const tempAIMessage = { 
      role: 'assistant', 
      content: 'AI 正在思考中...', 
      key: Date.now() + '_a_temp', 
      isTemp: true,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, tempAIMessage]);

    try {
      const aiText = await fetchAIResponse([...messages, userMessage]);
      const aiMessage = { 
        role: 'assistant', 
        content: '', 
        key: Date.now() + '_a',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev.filter(msg => !msg.isTemp), aiMessage]);

      typeWriterEffect(aiText, (partialText) => {
        setMessages(prev => prev.map(msg =>
          msg.key === aiMessage.key ? { ...msg, content: partialText } : msg
        ));
      });

    } catch {
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    } finally {
      setLoading(false);
    }
  };

const renderMessage = (item) => {
  const isUser = item.role === 'user';

  const handleExportWord = async () => {
    await exportWord([item]); // 只导出这一条 AI 消息
  };

  return (
    <List.Item className={`chat-item ${isUser ? 'user' : 'ai'}`}>
      {!isUser && <Avatar className="chat-avatar" icon={<RobotOutlined />} />}
      <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
        <div className="chat-content">
          {isUser ? item.content : <ReactMarkdown>{item.content}</ReactMarkdown>}
        </div>
        <div className="chat-timestamp">
          {item.timestamp}
          {!isUser && (
            <Button
              size="small"
              style={{ marginLeft: 8 }}
              onClick={handleExportWord}
            >
              导出至 Word
            </Button>
          )}
        </div>
      </div>
      {isUser && <Avatar className="chat-avatar" icon={<UserOutlined />} />}
    </List.Item>
  );
};


  return (
    <div className="chat-container">
      <div className="chat-list">
        <List
          dataSource={messages}
          renderItem={renderMessage}
          split={false}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <Input.TextArea
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="请输入您的问题(Shift+Enter换行，Enter发送)"
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={loading}
        />
        <Button
          type="primary"
          className="chat-send-button"
          onClick={handleSend}
          icon={<SendOutlined />}
          loading={loading}
          disabled={!inputValue.trim()}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default AIChat;
