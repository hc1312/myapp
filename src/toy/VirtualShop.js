import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, message, Tabs, Empty, Badge, Typography, Skeleton } from 'antd';
import { ShoppingCartOutlined, CoffeeOutlined, SmileOutlined, LaptopOutlined, SkinOutlined, ClockCircleOutlined, CarOutlined, RocketOutlined, HeartOutlined, HomeOutlined } from '@ant-design/icons';
import { service } from '../utils/request';
import BalanceCard from './BalanceCard';

const { Meta } = Card;
const { Text } = Typography;

const VirtualShop = () => {
    const [balance, setBalance] = useState(0);
    const [shopItems, setShopItems] = useState([]); // 从后端获取的商品列表
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true); // 全局加载状态
    const [buyLoading, setBuyLoading] = useState(null); // 记录哪一个商品正在执行购买

    // --- 1. 定义图标映射表 ---
    // 因为后端数据库存不了 React 组件，所以我们根据后端返回的图标标识符进行映射
    const iconMap = {
        food: <CoffeeOutlined />,
        fruit: <SmileOutlined />,
        tech: <LaptopOutlined />,
        cloth: <SkinOutlined />,
        luxury: <ClockCircleOutlined />,
        vehicle: <CarOutlined />,
        special: <RocketOutlined />,
        beauty: <HeartOutlined />,
        life: <HomeOutlined />
    };

    // --- 2. 接口调用函数 ---

    // 获取商品列表
    const fetchShopItems = async () => {
        setLoading(true);
        try {
            // 假设后端接口为 /api/shop/items
            const data = await service.get('/api/shop/items');
            setShopItems(data);
        } catch (e) {
            message.error('无法加载商店物品，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    // 获取用户余额
    const fetchBalance = async () => {
        try {
            const res = await service.get('/api/user/balance');
            setBalance(res.balance || 0);
        } catch (e) { console.error(e); }
    };

    // 获取用户背包
    const fetchInventory = async () => {
        try {
            const data = await service.get('/api/user/inventory');
            setInventory(data);
        } catch (e) { console.error(e); }
    };

    // 初始化加载
    useEffect(() => {
        fetchShopItems();
        fetchBalance();
        fetchInventory();
    }, []);

    // --- 3. 购买逻辑 ---
    const handleBuy = async (item) => {
        if (balance < item.price) {
            return message.error('余额不足，快去发红包找人领或者等别人发红包吧！');
        }

        setBuyLoading(item.id);
        try {
            await service.post('/api/user/buy_item', { item_id: item.id });
            message.success(`成功购买 ${item.name}！`);
            fetchBalance();    // 更新余额
            fetchInventory();  // 更新背包状态
        } catch (e) {
            message.error(e.response?.data?.message || '购买失败');
        } finally {
            setBuyLoading(null);
        }
    };

    // --- 4. 辅助渲染函数 ---
    const getTagColor = (type) => {
        const colors = { 'skin': 'magenta', 'title': 'gold', 'prop': 'blue' };
        return colors[type] || 'default';
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: 0 }}><ShoppingCartOutlined /> 商店</h2>
                    <Text type="secondary">快来消费吧 商品一经售出，概不退换</Text>
                </div>
                <div style={{ width: '240px' }}>
                    <BalanceCard />
                </div>
            </div>

            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: '商品列表',
                    children: (
                        <Row gutter={[16, 16]}>
                            {loading ? (
                                // 加载中的骨架屏
                                [1, 2, 3, 4].map(i => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                        <Card><Skeleton active /></Card>
                                    </Col>
                                ))
                            ) : shopItems.length > 0 ? (
                                shopItems.map(item => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                                        <Card
                                            hoverable
                                            actions={[
                                                <Button
                                                    type="primary"
                                                    danger
                                                    ghost
                                                    icon={<ShoppingCartOutlined />}
                                                    onClick={() => handleBuy(item)}
                                                    loading={buyLoading === item.id}
                                                >
                                                    ￥{item.price} 购买
                                                </Button>
                                            ]}
                                        >
                                            <Meta
                                                avatar={<div style={{ fontSize: '24px', color: '#ff4d6d' }}>
                                                    {iconMap[item.type] || <ShoppingCartOutlined />}
                                                </div>}
                                                title={item.name}
                                                description={item.description}
                                            />
                                            <div style={{ marginTop: '15px' }}>
                                                <Tag color={getTagColor(item.type)}>
                                                    {item.type_name || item.type}
                                                </Tag>
                                            </div>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col span={24}><Empty description="商店货架空了，店长正在补货..." /></Col>
                            )}
                        </Row>
                    )
                },
                {
                    key: '2',
                    label: <Badge count={inventory.length} offset={[10, 0]}>我的背包</Badge>,
                    children: (
                        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', minHeight: '300px' }}>
                            {inventory.length > 0 ? (
                                <Row gutter={[16, 16]}>
                                    {inventory.map(inv => (
                                        <Col xs={12} sm={8} md={6} key={inv.id}>
                                            <Card size="small" style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '30px' }}>{iconMap[inv.type]}</div>
                                                <div style={{ fontWeight: 'bold' }}>{inv.name}</div>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>{inv.buy_time}</Text>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Empty description="背包空空如也，快去买点东西吧" />
                            )}
                        </div>
                    )
                }
            ]} />
        </div>
    );
};

export default VirtualShop;