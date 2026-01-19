import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, message, Tag, Typography, Modal, Table, Avatar } from 'antd';
import axios from 'axios';
import { 
  TrophyOutlined, 
  StarOutlined, 
} from '@ant-design/icons';
import moment from 'moment';
import { getMatchesByTeam } from '../utils/request';

const { Title, Text } = Typography;
const API_BASE_URL = 'teams';

const WorldCupGroups = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMatchModalVisible, setIsMatchModalVisible] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [teamMatches, setTeamMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // ✨ 核心：球队名到国家缩写的映射 (用于加载国旗)
  const teamCodeMap = {
    // A组
    '墨西哥': 'mx', '南非': 'za', '韩国': 'kr', '欧洲附加赛D组胜者': 'eu',
    // B组
    '加拿大': 'ca', '卡塔尔': 'qa', '瑞士': 'ch', '欧洲附加赛A组胜者': 'eu',
    // C组
    '巴西': 'br', '摩洛哥': 'ma', '海地': 'ht', '苏格兰': 'gb-sct',
    // D组
    '美国': 'us', '巴拉圭': 'py', '澳大利亚': 'au', '欧洲附加赛C组胜者': 'eu',
    // E组
    '德国': 'de', '库拉索': 'cw', '科特迪瓦': 'ci', '厄瓜多尔': 'ec',
    // F组
    '荷兰': 'nl', '日本': 'jp', '突尼斯': 'tn', '欧洲附加赛B组胜者': 'eu',
    // G组
    '比利时': 'be', '埃及': 'eg', '伊朗': 'ir', '新西兰': 'nz',
    // H组
    '西班牙': 'es', '佛得角': 'cv', '沙特阿拉伯': 'sa', '乌拉圭': 'uy',
    // I组
    '法国': 'fr', '塞内加尔': 'sn', '挪威': 'no', '洲际附加赛2组胜者': 'un',
    // J组
    '阿根廷': 'ar', '阿尔及利亚': 'dz', '奥地利': 'at', '约旦': 'jo',
    // K组
    '葡萄牙': 'pt', '哥伦比亚': 'co', '乌兹别克斯坦': 'uz', '洲际附加赛1组胜者': 'un',
    // L组
    '英格兰': 'gb-eng', '克罗地亚': 'hr', '加纳': 'gh', '巴拿马': 'pa',
  };

  const continentColorMap = {
    '欧洲': '#1890ff', '南美洲': '#52c41a', '中北美及加勒比海': '#fa8c16',
    '亚洲': '#13c2c2', '非洲': '#eb2f96', '大洋洲': '#722ed1', '多大洲': '#fadb14',
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/query_all`);
      setTeams(response.data);
    } catch (error) {
      message.error('获取失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTeams(); }, []);

  const groupedTeams = useMemo(() => {
    if (teams.length === 0) return {};
    const groups = teams.reduce((acc, team) => {
      const groupKey = team.group_name;
      if (!groupKey) return acc;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(team);
      return acc;
    }, {});
    Object.keys(groups).forEach(key => groups[key].sort((a, b) => (a.world_ranking || 999) - (b.world_ranking || 999)));
    return groups;
  }, [teams]);

  const handleTeamClick = async (teamName) => {
    setSelectedTeamName(teamName);
    setIsMatchModalVisible(true);
    setMatchLoading(true);
    try {
      const data = await getMatchesByTeam(teamName);
      setTeamMatches(data.map(m => ({ ...m, key: m.id, match_time: moment(m.match_time).format('MM-DD HH:mm') })));
    } catch (error) { setTeamMatches([]); } finally { setMatchLoading(false); }
  };

  const matchColumns = [
    { title: '时间', dataIndex: 'match_time', key: 'match_time', width: 110 },
    { title: '阶段', dataIndex: 'stage', key: 'stage' },
    { title: '对阵', key: 'match', render: (_, r) => <Text strong>{r.home_team_name} vs {r.away_team_name}</Text> },
    { title: '比分', key: 'score', render: (_, r) => r.status === 'Finished' ? <Tag color="blue">{r.home_score}-{r.away_score}</Tag> : <Tag>VS</Tag> },
  ];

  const groupKeys = Object.keys(groupedTeams).sort();

  return (
    <div style={{ padding: '40px 24px', background: 'linear-gradient(180deg, #f0f2f5 0%, #ffffff 100%)', minHeight: '100vh' }}>
      {/* 引用外部国旗 CSS */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css" />

      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <Title level={1} style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '3px' }}>
          <TrophyOutlined style={{ color: '#d4b106', marginRight: '15px' }} />
          FIFA WORLD CUP 2026
        </Title>
        <Text type="secondary">每一张国旗背后，都是一个足球梦想 ⚽️</Text>
      </div>

      <Row gutter={[32, 32]}>
        {groupKeys.map(groupName => (
          <Col key={groupName} xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="group-card-upgraded"
              style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
              bodyStyle={{ padding: '0' }}
            >
              <div style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', padding: '22px', textAlign: 'center' }}>
                <Title level={3} style={{ color: '#fff', margin: 0, letterSpacing: '5px' }}>GROUP {groupName}</Title>
              </div>

              <div style={{ padding: '8px 0' }}>
                {groupedTeams[groupName].map((team) => {
                  const countryCode = teamCodeMap[team.name];
                  return (
                    <div key={team.id} className="team-row-item" onClick={() => handleTeamClick(team.name)}>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        {/* ✨ 国旗显示逻辑：如果有 code 就显国旗，否则显示首字母 */}
                        {countryCode ? (
                          <span 
                            className={`fi fi-${countryCode}`} 
                            style={{ 
                                fontSize: '24px', 
                                marginRight: 14, 
                                borderRadius: '4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                            }} 
                          />
                        ) : (
                          <Avatar size={32} style={{ backgroundColor: continentColorMap[team.continent], marginRight: 14 }}>
                            {team.name[0]}
                          </Avatar>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Text strong style={{ fontSize: '16px' }}>
                            {team.name}
                            {team.world_ranking <= 12 && <StarOutlined style={{ color: '#fadb14', marginLeft: 6 }} />}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>{team.continent}</Text>
                        </div>
                      </div>
                      <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>#{team.world_ranking || '--'}</Text>
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        visible={isMatchModalVisible}
        onCancel={() => setIsMatchModalVisible(false)}
        footer={null}
        width={720}
        centered
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>赛程详情</Title>
        <Table dataSource={teamMatches} columns={matchColumns} pagination={false} size="middle" />
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .group-card-upgraded { transition: all 0.4s ease; }
        .group-card-upgraded:hover { transform: translateY(-12px); box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important; }
        .team-row-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; cursor: pointer; }
        .team-row-item:hover { background: #f0f7ff; }
        .team-row-item:not(:last-child) { border-bottom: 1px dashed #f0f0f0; }
      `}} />
    </div>
  );
};

export default WorldCupGroups;