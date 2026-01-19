import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Popconfirm, message, Select, Card } from 'antd';
import { UserOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { getAllUsers, updateUserRole, deleteUser } from './utils/request';

const { Option } = Select;

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取当前登录用户，防止自己删掉自己
  const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      message.success('权限更新成功！✨');
      fetchUsers();
    } catch (error) {
      message.error('修改失败了...');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('该用户已被请出花园~');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <span><UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />{text}</span>
      ),
    },
    {
      title: '身份角色',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          defaultValue={role}
          style={{ width: 120 }}
          onChange={(value) => handleRoleChange(record.id, value)}
          disabled={record.id === currentUser.id} // 不能改自己的权限
        >
          <Option value="admin">
            <Tag color="gold">管理员</Tag>
          </Option>
          <Option value="user">
            <Tag color="blue">普通用户</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.id !== currentUser.id ? (
            <Popconfirm
              title="确定要注销这个用户吗？"
              description="该操作不可撤回哦！"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ) : (
            <span style={{ color: '#ccc' }}>（你自己）</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={<span><SafetyCertificateOutlined /> 用户权限管理中心</span>}
        style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default UserTable;