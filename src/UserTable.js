// 导入模块
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, ConfigProvider,theme } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import axios from 'axios';

// 定义表格组件
const UserTable = () => {
    // 定义表格的列
    // 定义表格的列
    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
            // 添加排序的函数
            sorter: (a, b) => a.name.localeCompare(b.name),
            // 添加可用的排序方式
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
            // 添加排序的函数
            sorter: (a, b) => a.age - b.age,
            // 添加可用的排序方式
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: '电话',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '工作地址',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Button danger type="primary" onClick={() => handleDelete(record.name)} style={{marginLeft:10}}>
                        删除
                    </Button>
                </div>
            ),
        },
    ];

    // 定义表格的数据源
    const [dataSource, setDataSource] = useState([]);
    // 定义表格的分页配置
    const pagination = {
        // 每页显示的条数
        pageSize: 9,
        // 当前页码
        current: 1,
        // 总数据量
        total: dataSource.length,
        // 分页改变的回调
        onChange: (page, pageSize) => {
            // 设置当前页码
            setCurrent(page);
            // 设置每页显示的条数
            setPageSize(pageSize);
        },
    };

    // 定义当前页码
    const [current, setCurrent] = useState(1);

    // 定义每页显示的条数
    const [pageSize, setPageSize] = useState(10);
    // 定义模态框的状态
    const [visible, setVisible] = useState(false);

    // 定义模态框的标题
    const [title, setTitle] = useState('');

    // 定义表单的初始值
    const [initialValues, setInitialValues] = useState({});

    // 定义表单的引用
    const [form] = Form.useForm();

    // 定义获取用户数据的方法
    const fetchUsers = () => {
        axios
            .get('http://192.168.10.186:5000/query_all')
            .then((res) => {
                setDataSource(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };


    // 定义插入用户的方法
    const insertUser = (user) => {
        axios
            .post('http://192.168.10.186::5000/insert_user', user)
            .then((res) => {
                message.success(res.data.message);
                fetchUsers();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // 定义删除用户的方法
    const deleteUser = (name) => {
        axios
            .delete(`http://192.168.10.186:5000/delete_user/${name}`)
            .then((res) => {
                message.success(res.data.message);
                fetchUsers();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // 定义修改用户的方法
    const updateUser = (user) => {
        axios
            .put('http://192.168.3.14::5000/update_user', user)
            .then((res) => {
                message.success(res.data.message);
                fetchUsers();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // 定义处理添加用户的方法
    const handleAdd = () => {
        setVisible(true);
        setTitle('添加用户');
        setInitialValues({});
        form.resetFields();
    };

    // 定义处理编辑用户的方法
    const handleEdit = (record) => {
        setVisible(true);
        setTitle('编辑用户');
        setInitialValues(record);
        form.setFieldsValue(record);
    };

    // 定义处理删除用户的方法
    const handleDelete = (name) => {
        Modal.confirm({
            title: '确定要删除该用户吗？',
            onOk: () => {
                deleteUser(name);
            },
        });
    };

    // 定义处理模态框确认的方法
    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                if (title === '添加用户') {
                    insertUser(values);
                } else {
                    updateUser(values);
                }
                setVisible(false);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // 定义处理模态框取消的方法
    const handleCancel = () => {
        setVisible(false);
    };

    // 使用useEffect钩子在组件挂载时获取用户数据
    useEffect(() => {
        fetchUsers();
    }, []);

    // 返回JSX元素
    return (
        <div>
            <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5A54F9",
          borderRadius: 16,
        },
      }}
    >
            <div style={{ textAlign: 'center' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    style={{ marginTop: 10, marginBottom: 10 }}
                >
                    添加用户
                </Button>
            </div>

            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="name"
                pagination={{pageSize: 8}}
            />
            <Modal
                title={title}
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} initialValues={initialValues}>
                    <Form.Item
                        label="姓名"
                        name="name"
                        rules={[{ required: true, message: '请输入姓名' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="性别"
                        name="gender"
                        rules={[{ required: true, message: '请输入性别' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="年龄"
                        name="age"
                        rules={[{ required: true, message: '请输入年龄' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="电话"
                        name="phone"
                        rules={[{ required: true, message: '请输入电话' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="工作地址"
                        name="address"
                        rules={[{ required: true, message: '请输入工作地址' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            </ConfigProvider>
        </div>
    );
};

// 导出表格组件
export default UserTable;
