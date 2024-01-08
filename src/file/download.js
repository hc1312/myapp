// 前端组件
import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm } from 'antd';
import axios from 'axios';
import FileSaver from 'file-saver';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

const Downloadfile = () => {
  // 定义columns数组
  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '大小（MB）',
      dataIndex: 'size',
      key: 'size',
    },
    // 添加一个新的元素，用于指定按钮的列名和数据源
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <div>
          {/* 使用Button和DownloadOutlined组件来实现下载功能 */}
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.name)}
          >
            下载
          </Button>
          {/* 使用Popconfirm和DeleteOutlined组件来实现删除功能 */}
          <Popconfirm
            title="确定要删除这个文件吗?"
            onConfirm={() => handleDelete(record.name)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              style={{ marginLeft: 8 }}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 定义state变量
  const [files, setFiles] = useState([]);

  // 使用useEffect钩子
  useEffect(() => {
    // 发送GET请求
    axios.get('http://192.168.10.186:5555/files')
      .then(res => {
        // 获取文件列表
        const fileList = res.data;
        // 赋值给state变量
        setFiles(fileList);
      })
      .catch(err => {
        // 处理错误
        console.error(err);
      });
  }, []);

  // 定义handleDownload函数
  const handleDownload = (name) => {
    // 发送GET请求，获取文件的二进制数据
    axios.get(`http://192.168.10.186:5555/files/${name}`, { responseType: 'blob' })
      .then(res => {
        // 获取文件的二进制数据
        const blob = res.data;
        // 使用FileSaver库来保存文件到本地
        FileSaver.saveAs(blob, name);
      })
      .catch(err => {
        // 处理错误
        console.error(err);
      });
  };

  // 定义handleDelete函数
  const handleDelete = (name) => {
    // 发送DELETE请求，传递文件的名称
    axios.delete(`http://192.168.10.186:5555/files/${name}`)
      .then(res => {
        // 获取响应信息
        const message = res.data;
        // 在控制台打印信息
        console.log(message);
        // 更新state变量，过滤掉被删除的文件
        setFiles(files.filter(file => file.name !== name));
      })
      .catch(err => {
        // 处理错误
        console.error(err);
      });
  };

  // 返回表格组件
  return (
    <Table dataSource={files} columns={columns} pagination={{pageSize:6}}/>
  );
};

export default Downloadfile;
