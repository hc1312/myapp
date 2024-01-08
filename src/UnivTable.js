// 前端react代码，使用Axios发送HTTP请求
import React, { useState, useEffect } from "react";
import { Table, Empty } from "antd";
import axios from "axios";
import { message } from "antd"; // 导入antd的message组件

// 定义表格的列标题和数据源
const columns = [
  {
    title: "排名",
    dataIndex: "rank",
    key: "rank",
  },
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "位置",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "建校时间",
    dataIndex: "founded",
    key: "founded",
  },
];

// 定义一个组件，用来显示表格
const UnivTable = () => {
  // 定义一个状态变量，用来存储表格的数据
  const [data, setData] = useState([]);
  // 定义一个状态变量，用来存储错误信息
  const [error, setError] = useState(null);
  // 定义一个状态变量，用来存储是否获取到数据的标志
  const [hasData, setHasData] = useState(true);

  // 使用useEffect钩子，在组件挂载时发送HTTP请求
  useEffect(() => {
    // 定义一个异步函数，用来获取数据
    const fetchData = async () => {
      try {
        // 发送GET请求
        const response = await axios.get("http://192.168.10.186:5000/api");
        // 判断返回的数据是否为空
        if (response.data.length === 0) {
          // 如果为空，把状态变量设置为false
          setHasData(false);
        } else {
          // 如果不为空，把返回的数据赋值给状态变量
          setData(response.data);
        }
      } catch (error) {
        // 如果发生错误，把错误信息赋值给状态变量
        setError(error.message);
      }
    };
    // 调用异步函数
    fetchData();
  }, []); // 传入一个空数组，表示只在组件挂载时执行一次


  // 如果没有错误信息，显示表格
  if (hasData) {
    // 如果有数据，显示数据
    return <Table columns={columns} dataSource={data} />;
  } else {
    // 如果没有数据，显示no data的文字和图标
    message.info("获取数据失败，请稍后重试");
    return (
      <Table
        columns={columns}
        dataSource={[]}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无数据"
            />
          ),
        }}
      />
    );
  }

};

export default UnivTable;
