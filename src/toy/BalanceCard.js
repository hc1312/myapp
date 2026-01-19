// src/components/BalanceCard.js
import React, { useState, useEffect } from 'react';
import { Card, Statistic } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { service } from '../utils/request';

const BalanceCard = () => {
  const [balance, setBalance] = useState(0.00);

  const fetchBalance = async () => {
    try {
      const res = await service.get('/api/user/balance');
      // 假设后端返回格式为 { balance: 100.00 }
      setBalance(res.balance || 0);
    } catch (e) {
      console.error("获取余额失败", e);
    }
  };

  useEffect(() => {
    fetchBalance();
    // 每5秒自动刷新一次余额，确保领取红包后能及时看到变化
    const timer = setInterval(fetchBalance, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card 
      size="small" 
      style={{ 
        marginBottom: 15, 
        borderRadius: 12, 
        background: 'linear-gradient(135deg, #fff 0%, #fffafa 100%)',
        border: '1px solid #ffccd5',
        boxShadow: '0 2px 4px rgba(255, 77, 109, 0.05)'
      }}
    >
      <Statistic 
        title={<span style={{ color: '#888', fontSize: '12px' }}>账户余额 </span>}
        value={balance} 
        precision={2} 
        prefix={<WalletOutlined style={{ color: '#ff4d6d', marginRight: 8 }} />} 
        valueStyle={{ color: '#ff4d6d', fontWeight: 'bold', fontSize: '20px' }}
      />
    </Card>
  );
};

export default BalanceCard;