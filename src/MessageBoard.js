import React, { useState, useEffect } from 'react';
import { Drawer, Button, Input, List, message, Card, Row, Col, Popconfirm } from 'antd';
import { FloatButton } from 'antd';
import axios from 'axios';
import { PlusOutlined, DeleteOutlined, MessageOutlined } from "@ant-design/icons";
const { TextArea } = Input;
const MessageBoard = () => {
  // 定义抽屉的状态
  const [visible, setVisible] = useState(false);

  // 定义输入框的值
  const [value, setValue] = useState('');

  // 定义列表的数据源
  const [dataSource, setDataSource] = useState([]);

  // 定义获取留言的方法
  const fetchMessages = () => {
    axios
      .get('http://192.168.10.186:5000/query_guestbook')
      .then((res) => {
        setDataSource(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 定义插入留言的方法
  const insertMessage = (content) => {
    console.log(content);
    axios
      .post(
        'http://192.168.10.186:5000/insert_message',
        { content },
        // 添加请求头的content-type属性
        { headers: { 'content-type': 'application/json' } }
      )
      .then((res) => {
        message.success("留言成功！");
        fetchMessages();
      })
      .catch((err) => {
        // 显示错误信息
        message.error(err.response.data.message);
        console.log(err);
      });
  };
  // 定义删除留言的方法
  const deleteMessage = (uid) => {
    axios
      .delete(`http://192.168.10.186:5000/delete_message/${uid}`)
      .then((res) => {
        message.success("删除成功");
        fetchMessages();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 定义处理按钮点击的方法
  const handleClick = () => {
    // 打开抽屉
    setVisible(true);
    // 清空输入框的值
    setValue('');
  };

  // 定义处理抽屉关闭的方法
  const handleClose = () => {
    // 关闭抽屉
    setVisible(false);
  };

  // 定义处理输入框变化的方法
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  // 定义处理输入框回车的方法
  const handlePressEnter = () => {
    if (value) {
      insertMessage(value);
      setVisible(false);
    }
  };

  // 定义处理删除按钮点击的方法
  const handleDelete = (uid) => {
    // 调用删除留言的方法
    deleteMessage(uid);
  };

  // 使用useEffect钩子在组件挂载时获取留言
  useEffect(() => {
    fetchMessages();
  }, []);

  // 返回JSX元素
  return (
    <div>
      {/* <div style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleClick}
          style={{ margin: 'auto', marginBottom: 10, marginTop: 10 }}
        >
          留 言
        </Button>
      </div> */}
      <Drawer
        title="请输入留言内容，按回车发送"
        placement="right"
        closable={false}
        onClose={handleClose}
        visible={visible}
      >

        <TextArea rows={10} value={value}
          onChange={handleChange}
          onPressEnter={handlePressEnter} />


      </Drawer>

      <Row gutter={[16, 16]}>
        {dataSource.map((item) => (
          <Col span={6}>
            <Card
              actions={[
                <Popconfirm
                  title="确定要删除这条留言吗?"
                  onConfirm={() => handleDelete(item.uuid)}
                  okText="确定"
                  cancelText="不不不"
                >
                  <Button
                    danger
                    type="link"
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                </Popconfirm>
              ]}
            >
              {item.content}
            </Card>
          </Col>
        ))}
      </Row>
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        onClick={handleClick}
        description="留言"
      />
    </div>
  );
};

export default MessageBoard;
