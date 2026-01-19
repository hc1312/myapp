import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi } from './utils/request';
import confetti from 'canvas-confetti';

const { Text, Title } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeKey, setActiveKey] = useState('1'); 

    // 庆祝纸屑函数
    const fireCelebrateConfetti = () => {
        const count = 200;
        const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
        const fire = (particleRatio, opts) => {
            confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
        };
        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff4d6d', '#ffb703', '#69c0ff'] });
        fire(0.2, { spread: 60, colors: ['#ff4d6d', '#ffffff'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    };

    const onLogin = async (values) => {
        setLoading(true);
        try {
            const res = await loginApi(values);
            localStorage.setItem('token', res.token);
            localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
            message.success(res.message || '欢迎回来！');
            fireCelebrateConfetti();
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            message.error(error.response?.data?.message || '登录失败，请检查账号密码');
        } finally {
            setLoading(false);
        }
    };

    const onRegister = async (values) => {
        setLoading(true);
        try {
            const res = await registerApi(values);
            message.success(res.message || '注册成功！请登录');
            fireCelebrateConfetti();
            setActiveKey('1'); // 注册成功后自动跳回登录页
        } catch (error) {
            message.error(error.response?.data?.message || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // 柔和的渐变背景
            padding: '20px'
        }}>
            <Card 
                style={{ 
                    width: 400, 
                    borderRadius: 16, 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    border: 'none'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ 
                        fontSize: '40px', 
                        background: '#ff4d6d', 
                        width: '64px', 
                        height: '64px', 
                        lineHeight: '64px', 
                        borderRadius: '16px', 
                        color: '#fff',
                        margin: '0 auto 16px'
                    }}>
                        <RocketOutlined />
                    </div>
                    <Title level={3} style={{ margin: 0 }}>你好 世界</Title>
                    <Text type="secondary">欢迎加入我们的探索之旅</Text>
                </div>

                <Tabs 
                    activeKey={activeKey} 
                    onChange={setActiveKey}
                    centered
                    items={[
                        {
                            key: '1',
                            label: '登 录',
                            children: (
                                <Form onFinish={onLogin} layout="vertical" size="large">
                                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="用户名" />
                                    </Form.Item>
                                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="密码" />
                                    </Form.Item>
                                    <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 45, borderRadius: 8 }}>
                                        立即登录
                                    </Button>
                                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                                        <Text type="secondary">还没有账号？</Text>
                                        <Button type="link" onClick={() => setActiveKey('2')} style={{ padding: '0 4px' }}>
                                            立即注册
                                        </Button>
                                    </div>
                                </Form>
                            ),
                        },
                        {
                            key: '2',
                            label: '注 册',
                            children: (
                                <Form onFinish={onRegister} layout="vertical" size="large">
                                    <Form.Item name="username" rules={[{ required: true, message: '起个响亮的名字' }]}>
                                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="新用户名" />
                                    </Form.Item>
                                    <Form.Item name="password" rules={[{ required: true, message: '设置一个安全的密码' }]}>
                                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="设置密码" />
                                    </Form.Item>
                                    <Button type="default" htmlType="submit" block loading={loading} style={{ height: 45, borderRadius: 8, background: '#f5f5f5' }}>
                                        创建账号
                                    </Button>
                                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                                        <Text type="secondary">已有账号？</Text>
                                        <Button type="link" onClick={() => setActiveKey('1')} style={{ padding: '0 4px' }}>
                                            直接登录
                                        </Button>
                                    </div>
                                </Form>
                            ),
                        },
                    ]} 
                />
                
                <Divider plain><Text style={{ color: '#d9d9d9', fontSize: 12 }}>HAPPY 2026</Text></Divider>
                <div style={{ textAlign: 'center' }}>
                    <SmileOutlined style={{ color: '#d9d9d9' }} />
                </div>
            </Card>
        </div>
    );
};

export default Login;