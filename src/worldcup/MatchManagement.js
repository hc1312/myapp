import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Row, Col, Space, message, Popconfirm, DatePicker, Select, Tag } from 'antd';
import moment from 'moment';
import { getMatches, addMatch, updateMatch, deleteMatch, getTeams, deleteMatches } from '../utils/request';

// 辅助数据：阶段、状态和分组选项
const STAGE_OPTIONS = [
    { value: '小组赛', label: '小组赛' },
    { value: '32强赛', label: '32强赛' },
    { value: '16强赛', label: '16强赛' },
    { value: '四分之一决赛', label: '四分之一决赛' },
    { value: '半决赛', label: '半决赛' },
    { value: '三四名决赛', label: '三四名决赛' },
    { value: '决赛', label: '决赛' },
];
const STATUS_OPTIONS = [
    { value: '未开始', label: '未开始' },
    { value: '进行中', label: '进行中' },
    { value: '已结束', label: '已结束' },
];
const GROUP_OPTIONS = [
    { value: 'A', label: 'A组' }, { value: 'B', label: 'B组' }, { value: 'C', label: 'C组' }, { value: 'D', label: 'D组' },
    { value: 'E', label: 'E组' }, { value: 'F', label: 'F组' }, { value: 'G', label: 'G组' }, { value: 'H', label: 'H组' },
    { value: 'I', label: 'I组' }, { value: 'J', label: 'J组' }, { value: 'K', label: 'K组' }, { value: 'L', label: 'L组' },
    { value: '', label: '未分组 / N/A' },
];

const MatchManagement = () => {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);
    const [form] = Form.useForm();

    // 1. 新增状态：存储选中的行 ID
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // 获取比赛列表
    const fetchMatches = async () => {
        setLoading(true);
        try {
            const data = await getMatches();
            // 确保数据中有一个唯一的 key，这里使用 id
            setMatches(data.map(item => ({ ...item, key: item.id })));
        } catch (error) {
            // 错误已在 request.js 中统一处理
        } finally {
            setLoading(false);
        }
    };

    // 获取球队列表（用于下拉选择框）
    const fetchTeamsList = async () => {
        try {
            // 假设 getTeams 返回 [{name: '队名'}, ...]
            const data = await getTeams();
            setTeams(data.map(t => ({ value: t.name, label: t.name })));
        } catch (error) {
            // 错误已在 request.js 中统一处理
        }
    };

    useEffect(() => {
        fetchMatches();
        fetchTeamsList();
    }, []);

    // 弹窗表单保存逻辑
    const handleSave = async (values) => {
        setLoading(true);
        // 格式化日期：使用 match_time 字段名
        const matchData = {
            ...values,
            match_time: values.match_time ? values.match_time.format('YYYY-MM-DD HH:mm:ss') : null,
            // 确保分数是数字或 NULL
            home_score: values.home_score !== undefined ? Number(values.home_score) : null,
            away_score: values.away_score !== undefined ? Number(values.away_score) : null,
        };

        try {
            if (editingMatch) {
                // 更新
                await updateMatch({ ...matchData, id: editingMatch.id });
                message.success('比赛信息更新成功!');
            } else {
                // 新增
                await addMatch(matchData);
                message.success('比赛创建成功!');
            }
            setIsModalVisible(false);
            form.resetFields();
            setEditingMatch(null);
            await fetchMatches(); // 重新加载数据
        } catch (error) {
            // 错误已在 request.js 中统一处理
        } finally {
            setLoading(false);
        }
    };

    // 单个删除逻辑
    const handleDelete = async (matchId) => {
        try {
            await deleteMatch(matchId);
            message.success('比赛已删除.');
            setSelectedRowKeys(prevKeys => prevKeys.filter(key => key !== matchId)); // 从选中列表中移除
            await fetchMatches();
        } catch (error) {
            // 错误已在 request.js 中统一处理
        }
    };

    // 2. 新增：批量删除逻辑
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请至少选择一条比赛记录进行删除。');
            return;
        }

        setLoading(true);
        try {
            // 调用新的批量删除 API
            await deleteMatches(selectedRowKeys);
            message.success(`成功删除 ${selectedRowKeys.length} 条比赛记录!`);
            setSelectedRowKeys([]); // 清空选中状态
            await fetchMatches();
        } catch (error) {
            // 错误已在 request.js 中统一处理
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingMatch(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingMatch(record);
        // 格式化日期和分数
        form.setFieldsValue({
            ...record,
            match_time: record.match_time ? moment(record.match_time) : null,
            home_score: record.home_score !== null ? Number(record.home_score) : undefined,
            away_score: record.away_score !== null ? Number(record.away_score) : undefined,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingMatch(null);
        form.resetFields();
    };

    // 3. 配置行选择
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {
            setSelectedRowKeys(keys);
        },
        // 可选：禁用某些行（例如，已结束的比赛）
        getCheckboxProps: (record) => ({
            disabled: record.status === '已结束' || record.status === '进行中',
        }),
    };

    // 表格列配置
    const columns = [
        { title: '阶段', dataIndex: 'stage', key: 'stage', filters: STAGE_OPTIONS, onFilter: (value, record) => record.stage === value },
        { title: '分组', dataIndex: 'group_name', key: 'group_name', render: text => text ? `${text}组` : 'N/A' },
        { title: '主队', dataIndex: 'home_team_name', key: 'home_team_name' },
        { title: '客队', dataIndex: 'away_team_name', key: 'away_team_name' },
        { title: '场馆', dataIndex: 'venue', key: 'venue' },
        { title: '时间', dataIndex: 'match_time', key: 'match_time', render: text => moment(text).format('YYYY-MM-DD HH:mm') },
        { title: '比分', key: 'score', render: (_, record) => record.status === '已结束' ? `${record.home_score} - ${record.away_score}` : record.status === '进行中' ? 'LIVE' : 'N/A' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            filters: STATUS_OPTIONS,
            onFilter: (value, record) => record.status === value,
            render: (text) => {
                let color;
                if (text === '已结束') color = 'default';
                else if (text === '进行中') color = 'volcano';
                else color = 'geekblue'; // 未开始
                return <Tag color={color} key={text}>{text}</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleEdit(record)} type="link">编辑</Button>
                    <Popconfirm
                        title={`确定删除比赛 ${record.home_team_name} vs ${record.away_team_name} 吗?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="是"
                        cancelText="否"
                    >
                        <Button type="link" danger>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const initialFormValues = editingMatch ? {
        ...editingMatch,
        match_time: editingMatch.match_time ? moment(editingMatch.match_time) : null,
    } : {};


    return (
        <div style={{ padding: 24 }}>
            <h2>比赛赛程管理</h2>

            {/* 4. 新增批量删除按钮及空间布局 */}
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={handleAdd}>
                    新增比赛
                </Button>
                <Popconfirm
                    title={`确定删除选中的 ${selectedRowKeys.length} 条比赛记录吗?`}
                    onConfirm={handleBatchDelete}
                    okText="是"
                    cancelText="否"
                    disabled={selectedRowKeys.length === 0}
                >
                    <Button type="danger" disabled={selectedRowKeys.length === 0} loading={loading}>
                        批量删除 ({selectedRowKeys.length})
                    </Button>
                </Popconfirm>
            </Space>

            <Table
                // 5. 将 rowSelection 配置传入 Table
                rowSelection={rowSelection}
                dataSource={matches}
                columns={columns}
                loading={loading}
                pagination={{ pageSize: 10 }}
                bordered
            />

            <Modal
                title={editingMatch ? '编辑比赛信息' : '创建新比赛'}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose={true}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialFormValues}
                    onFinish={handleSave}
                >
                    <Form.Item name="stage" label="比赛阶段" rules={[{ required: true, message: '请选择比赛阶段!' }]}>
                        <Select options={STAGE_OPTIONS} placeholder="选择阶段" />
                    </Form.Item>

                    <Form.Item name="group_name" label="所在分组 (可选)">
                        <Select options={GROUP_OPTIONS} placeholder="选择分组" allowClear />
                    </Form.Item>

                    <Form.Item name="match_time" label="比赛时间" rules={[{ required: true, message: '请选择比赛时间!' }]}>
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="venue" label="比赛场馆" rules={[{ required: true, message: '请输入场馆名称!' }]}>
                        <Input placeholder="输入场馆名称" />
                    </Form.Item>

                    {/* 1. 使用 Row 和 Col 替换 Space 来实现分栏布局 */}
                    <Row gutter={24}> {/* gutter={24} 提供列之间的间距 */}
                        <Col span={12}> {/* 占据 12/24 = 50% 宽度 */}
                            <Form.Item
                                name="home_team_name"
                                label="主队"
                                rules={[{ required: true, message: '请选择主队!' }]}
                            >
                                <Select showSearch options={teams} placeholder="选择主队" />
                            </Form.Item>
                        </Col>
                        <Col span={12}> {/* 占据 12/24 = 50% 宽度 */}
                            <Form.Item
                                name="away_team_name"
                                label="客队"
                                rules={[{ required: true, message: '请选择客队!' }]}
                            >
                                <Select showSearch options={teams} placeholder="选择客队" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* 比分及状态：编辑或已结束时可见 */}
                    {(editingMatch || form.getFieldValue('status') === '已结束' || form.getFieldValue('status') === '进行中') && (
                        <>
                            <Form.Item name="status" label="比赛状态" rules={[{ required: true, message: '请选择比赛状态!' }]}>
                                <Select options={STATUS_OPTIONS} placeholder="选择状态" />
                            </Form.Item>
                            <Space>
                                <Form.Item name="home_score" label="主队得分" style={{ display: 'inline-block', width: 120 }}>
                                    <InputNumber min={0} placeholder="比分" />
                                </Form.Item>
                                <Form.Item name="away_score" label="客队得分" style={{ display: 'inline-block', width: 120 }}>
                                    <InputNumber min={0} placeholder="比分" />
                                </Form.Item>
                            </Space>
                        </>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }} loading={loading}>
                            {editingMatch ? '保存修改' : '立即创建'}
                        </Button>
                        <Button onClick={handleCancel}>
                            取消
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MatchManagement;