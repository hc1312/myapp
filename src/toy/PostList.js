import React from 'react';
import { Divider, Tooltip } from 'antd';
import { LikeOutlined, DislikeOutlined, MessageOutlined } from '@ant-design/icons';

const CommentItem = ({ username, content, time, likes, isReply = false, children }) => {
  return (
    <div style={{
      paddingLeft: isReply ? '44px' : '0',
      marginBottom: '16px',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* 用户名 */}
        <span style={{
          color: isReply ? '#777' : '#fb7299',
          fontWeight: 'bold',
          marginBottom: '4px',
          cursor: 'pointer'
        }}>
          {username}
        </span>

        {/* 内容 */}
        <div style={{ color: '#222', lineHeight: '1.5', marginBottom: '8px' }}>
          {content}
        </div>

        {/* 底部操作栏 */}
        <div style={{ display: 'flex', alignItems: 'center', color: '#9499a0', fontSize: '12px', gap: '20px' }}>
          <span>{time}</span>
          <span style={{ cursor: 'pointer' }}><LikeOutlined /> {likes > 0 ? likes : ''}</span>
          <span style={{ cursor: 'pointer' }}><DislikeOutlined /></span>
          <span style={{ cursor: 'pointer' }}>回复</span>
        </div>
      </div>

      {/* 渲染子回复 */}
      {children && <div style={{ marginTop: '12px' }}>{children}</div>}
    </div>
  );
};

const PostList = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', background: '#fff', padding: '20px' }}>
      {/* 帖子示例 1 */}
      <CommentItem
        username="李美子"
        content="顾艳梅，快到我办公室来"
        time="2025-09-15 08:16"
        likes={8}
      >
        <CommentItem
          username="顾艳梅"
          isReply={true}
          content="不好意思老师，刚睡醒"
          time="2025-09-15 12:01"
          likes={1}
        />
        <CommentItem
          username="顾艳梅"
          isReply={true}
          content="什么事啊"
          time="2025-09-15 12:02"
          likes={1}
        />
        <div style={{ color: '#9499a0', fontSize: '12px', marginLeft: '44px', cursor: 'pointer' }}>
          共3条回复，点击查看
        </div>
      </CommentItem>

      <Divider />

      <CommentItem
        username="胡正欣"
        content="你们元旦 有什么安排"
        time="2025-12-29 14:53"
        likes={0}
      />
      <CommentItem
        username="姜馨蕴"
        isReply={true}
        content="home"
        time="2025-12-29 14:54"
        likes={1}
      />
      <Divider />

      <div style={{
        background: '#f1f2f3',
        padding: '10px 15px',
        borderRadius: '6px',
        color: '#9499a0',
        marginTop: '30px'
      }}>
        这里是评论区，不是无人区;-)
      </div>
    </div>
  );
};

export default PostList;