import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Select,
  Tag
} from 'antd';
import { getTeams, addTeam, updateTeam, deleteTeam } from '../utils/request';

const GROUP_OPTIONS = [
  { value: 'A', label: 'A组' }, { value: 'B', label: 'B组' },
  { value: 'C', label: 'C组' }, { value: 'D', label: 'D组' },
  { value: 'E', label: 'E组' }, { value: 'F', label: 'F组' },
  { value: 'G', label: 'G组' }, { value: 'H', label: 'H组' },
  { value: 'I', label: 'I组' }, { value: 'J', label: 'J组' },
  { value: 'K', label: 'K组' }, { value: 'L', label: 'L组' },
  { value: '', label: '未分组 / N/A' }
];

const CONTINENT_OPTIONS = [
  { value: '欧洲', label: '欧洲 (UEFA)' },
  { value: '南美洲', label: '南美洲 (CONMEBOL)' },
  { value: '中北美及加勒比海', label: '中北美及加勒比海 (CONCACAF)' },
  { value: '亚洲', label: '亚洲 (AFC)' },
  { value: '非洲', label: '非洲 (CAF)' },
  { value: '大洋洲', label: '大洋洲 (OFC)' },
  { value: '多大洲', label: '多大洲（附加赛）' }
];

const continentColorMap = {
  欧洲: 'blue',
  南美洲: 'green',
  亚洲: 'volcano',
  非洲: 'gold',
  中北美及加勒比海: 'cyan',
  大洋洲: 'purple',
  多大洲: 'magenta'
};

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form] = Form.useForm();

  // === API 调用 ===
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await getTeams();
      setTeams(data.map(team => ({ ...team, key: team.name })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      if (editingTeam) {
        await updateTeam(values);
        message.success('球队信息更新成功');
      } else {
        await addTeam(values);
        message.success('球队创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchTeams();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name) => {
    await deleteTeam(name);
    message.success(`球队 ${name} 已删除`);
    fetchTeams();
  };

  // === 交互 ===
  const handleEdit = (record) => {
    setEditingTeam(record);
    form.setFieldsValue({
      ...record,
      world_ranking: record.world_ranking ? Number(record.world_ranking) : undefined
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingTeam(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingTeam(null);
  };

  // === 表格列（完全保持原定义，仅美化 render）===
  const columns = [
    {
      title: '球队名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: '世界排名',
      dataIndex: 'world_ranking',
      key: 'world_ranking',
      sorter: (a, b) => (a.world_ranking || 999) - (b.world_ranking || 999),
      render: rank => rank || 'N/A'
    },
    {
      title: '所属大洲',
      dataIndex: 'continent',
      key: 'continent',
      render: continent => (
        <Tag color={continentColorMap[continent] || 'default'}>
          {continent || '未定'}
        </Tag>
      )
    },
    { title: '主教练', dataIndex: 'coach', key: 'coach' },
    {
      title: '所在分组',
      dataIndex: 'group_name',
      key: 'group_name',
      render: g => g ? `Group ${g}` : 'N/A'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title={`确定删除球队 ${record.name} 吗？`}
            onConfirm={() => handleDelete(record.name)}
            okText="是"
            cancelText="否"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: 24 }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
        }}
      >
        {/* 标题区 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>⚽ 球队信息管理</h2>
            <div style={{ color: '#888', marginTop: 4 }}>
              管理参赛球队的基础信息与分组情况
            </div>
          </div>
          <Button type="primary" onClick={handleAdd}>
            新增球队
          </Button>
        </div>

        {/* 表格 */}
        <Table
          dataSource={teams}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          bordered={false}
          rowClassName={() => 'pretty-row'}
        />

        {/* 弹窗 */}
        <Modal
          title={editingTeam ? '编辑球队信息' : '创建新球队'}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          destroyOnClose
          bodyStyle={{ paddingTop: 12 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              name="name"
              label="球队名称"
              rules={[{ required: true, message: '请输入球队名称' }]}
            >
              <Input disabled={!!editingTeam} />
            </Form.Item>

            <Form.Item name="world_ranking" label="世界排名">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="continent" label="所属大洲">
              <Select options={CONTINENT_OPTIONS} allowClear />
            </Form.Item>

            <Form.Item name="coach" label="主教练">
              <Input />
            </Form.Item>

            <Form.Item name="group_name" label="所在分组">
              <Select options={GROUP_OPTIONS} allowClear />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTeam ? '保存修改' : '立即创建'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>

      {/* 轻量样式增强 */}
      <style>
        {`
          .pretty-row td {
            padding: 14px 16px !important;
          }
          .ant-table-thead > tr > th {
            background: #fafafa !important;
            font-weight: 600;
          }
          .ant-table {
            border-radius: 10px;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
};

export default TeamManagement;