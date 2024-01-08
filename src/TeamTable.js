import React, { useState } from "react";
import { Menu, Table } from "antd";

// 英超球队和城市的数据
const premierLeagueData = [
  {
    key: "1",
    team: "曼城",
    city: "曼彻斯特",
    points: 33, // 添加积分字段
  },
  {
    key: "2",
    team: "利物浦",
    city: "利物浦",
    points: 37, // 添加积分字段
  },
  {
    key: "3",
    team: "切尔西",
    city: "伦敦",
    points: 19, // 添加积分字段
  },
  {
    key: "4",
    team: "莱斯特城",
    city: "莱斯特",
    points: 26, // 添加积分字段
  },
  // 补充其他球队和积分
  {
    key: "5",
    team: "热刺",
    city: "伦敦",
    points: 33, // 添加积分字段
  },
  {
    key: "6",
    team: "曼联",
    city: "曼彻斯特",
    points: 27, // 添加积分字段
  },
  {
    key: "7",
    team: "纽卡斯尔",
    city: "纽卡斯尔",
    points: 26, // 添加积分字段
  },
  {
    key: "8",
    team: "布莱顿",
    city: "布莱顿",
    points: 26, // 添加积分字段
  },
  {
    key: "9",
    team: "西汉姆联",
    city: "伦敦",
    points: 24, // 添加积分字段
  },
  {
    key: "10",
    team: "富勒姆",
    city: "伦敦",
    points: 21, // 添加积分字段
  },
  {
    key: "11",
    team: "布伦特福德",
    city: "伦敦",
    points: 19, // 添加积分字段
  },
  {
    key: "12",
    team: "切尔西",
    city: "伦敦",
    points: 19, // 添加积分字段
  },
  {
    key: "13",
    team: "狼队",
    city: "伍尔弗汉普顿",
    points: 19, // 添加积分字段
  },
  {
    key: "14",
    team: "伯恩茅斯",
    city: "伯恩茅斯",
    points: 19, // 添加积分字段
  },
  {
    key: "15",
    team: "水晶宫",
    city: "伦敦",
    points: 16, // 添加积分字段
  },
  {
    key: "16",
    team: "诺丁汉森林",
    city: "诺丁汉",
    points: 14, // 添加积分字段
  },
  {
    key: "17",
    team: "埃弗顿",
    city: "利物浦",
    points: 13, // 添加积分字段
  },
  {
    key: "18",
    team: "卢顿",
    city: "卢顿",
    points: 9, // 添加积分字段
  },
  {
    key: "19",
    team: "伯恩利",
    city: "伯恩利",
    points: 8, // 添加积分字段
  },
  {
    key: "20",
    team: "谢菲尔德联",
    city: "谢菲尔德",
    points: 8, // 添加积分字段
  },
];
// 西甲球队和城市的数据
const laLigaData = [
  {
    key: "1",
    team: "巴塞罗那",
    city: "巴塞罗那",
  },
  {
    key: "2",
    team: "皇家马德里",
    city: "马德里",
  },
  {
    key: "3",
    team: "马德里竞技",
    city: "马德里",
  },
  {
    key: "4",
    team: "塞维利亚",
    city: "塞维利亚",
  },
];

// 表格的列配置
const columns = [
  {
    title: "球队",
    dataIndex: "team",
    key: "team",
  },
  {
    title: "城市",
    dataIndex: "city",
    key: "city",
  },
  {
    title: "积分",
    dataIndex: "points",
    key: "points",
  },
];

export default function TeamTable() {
  // 定义一个状态变量，用于存储当前选中的菜单项
  const [selectedMenu, setselectedMenu] = useState("premierLeague");

  // 定义一个状态变量，用于存储当前显示的表格数据
  const [tableData, settableData] = useState(premierLeagueData);

  // 定义一个函数，用于处理菜单项的点击事件
  const handleMenuClick = (e) => {
    // 根据点击的菜单项的key，切换表格数据
    switch (e.key) {
      case "premierLeague":
        settableData(premierLeagueData);
        break;
      case "laLiga":
        settableData(laLigaData);
        break;
      default:
        break;
    }
    // 更新选中的菜单项
    setselectedMenu(e.key);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* 左侧菜单，垂直模式 */}
      <Menu
        onClick={handleMenuClick}
        // style={{ width: 256 }}
        selectedKeys={[selectedMenu]}
        mode="vertical"
      >
        <Menu.Item key="premierLeague">英超</Menu.Item>
        <Menu.Item key="laLiga">西甲</Menu.Item>
      </Menu>
      {/* 右侧表格，根据表格数据和列配置渲染 */}
      <Table dataSource={tableData} columns={columns} style={{ width: 800 }}/>
    </div>
  );
}