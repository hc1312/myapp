import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Typography, Modal, Tag, Space, Radio } from 'antd';
import { UndoOutlined, ReloadOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BOARD_SIZE = 15;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#f0f2f5',
    minHeight: '100vh',
  },
  board: {
    display: 'grid',
    // 关键：不再使用固定 30px，而是根据屏幕宽度计算
    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
    gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
    width: 'min(90vw, 500px)', // 取屏幕宽度的 90% 或最大 500px
    height: 'min(90vw, 500px)',
    backgroundColor: '#e6cca0',
    border: '4px solid #8b5a2b',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    margin: '20px auto',
  },
  cell: {
    width: '100%',
    height: '100%',
    border: '0.5px solid rgba(139, 90, 43, 0.3)', // 线条细一点
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  piece: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    transition: 'all 0.2s',
    position: 'relative',
  },
  lastMoveMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '8px',
    height: '8px',
    backgroundColor: '#ff4d4f',
    borderRadius: '50%',
    boxShadow: '0 0 4px #ff4d4f',
    zIndex: 10,
  }
};

const Gomoku = () => {
  const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [isBlackNext, setIsBlackNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastMoveIndex, setLastMoveIndex] = useState(null);

  // --- 新增：游戏模式 (pvp 或 pve) ---
  const [gameMode, setGameMode] = useState('pve');
  // --- 新增：AI 是否正在思考（防止快速点击） ---
  const [isAiThinking, setIsAiThinking] = useState(false);

  // 胜利判定逻辑 (复用)
  const checkWinner = (squares, index, currentPlayer) => {
    const x = index % BOARD_SIZE;
    const y = Math.floor(index / BOARD_SIZE);
    const directions = [[[1, 0], [-1, 0]], [[0, 1], [0, -1]], [[1, 1], [-1, -1]], [[1, -1], [-1, 1]]];

    for (let direction of directions) {
      let count = 1;
      for (let side of direction) {
        let dx = side[0], dy = side[1], nx = x + dx, ny = y + dy;
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && squares[ny * BOARD_SIZE + nx] === currentPlayer) {
          count++; nx += dx; ny += dy;
        }
      }
      if (count >= 5) return true;
    }
    return false;
  };

  // --- 核心：AI 评分算法 ---
  const getBestMove = (currentBoard) => {
    let bestScore = -Infinity;
    let bestMove = -1;

    // 遍历棋盘所有空位
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i]) continue;

      const x = i % BOARD_SIZE;
      const y = Math.floor(i / BOARD_SIZE);

      // 评分规则：
      // AI 是白棋 (white)，玩家是黑棋 (black)
      // 计算：如果 AI 下这里得多少分？如果玩家下这里得多少分？
      const attackScore = evaluatePosition(currentBoard, x, y, 'white');
      const defenseScore = evaluatePosition(currentBoard, x, y, 'black');

      // 综合评分：防守通常比进攻重要，防止暴毙，但如果有必胜机会也要抓住
      // 这里给防守稍高的权重
      const score = attackScore * 1 + defenseScore * 1.2;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
    return bestMove;
  };

  // 单点评分逻辑
  const evaluatePosition = (squares, x, y, role) => {
    let totalScore = 0;
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]; // 横、纵、对角

    for (let [dx, dy] of directions) {
      let count = 1; // 连子数
      let emptyEnds = 0; // 两端是否为空

      // 正向检查
      for (let i = 1; i <= 4; i++) {
        const nx = x + dx * i, ny = y + dy * i;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
        if (squares[ny * BOARD_SIZE + nx] === role) {
          count++;
        } else if (squares[ny * BOARD_SIZE + nx] === null) {
          emptyEnds++;
          break;
        } else {
          break; // 被堵死
        }
      }

      // 反向检查
      for (let i = 1; i <= 4; i++) {
        const nx = x - dx * i, ny = y - dy * i;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
        if (squares[ny * BOARD_SIZE + nx] === role) {
          count++;
        } else if (squares[ny * BOARD_SIZE + nx] === null) {
          emptyEnds++;
          break;
        } else {
          break;
        }
      }

      // 给分规则 (简易版)
      if (count >= 5) totalScore += 100000;      // 成5
      else if (count === 4 && emptyEnds === 2) totalScore += 10000; // 活4
      else if (count === 4 && emptyEnds === 1) totalScore += 1000;  // 冲4
      else if (count === 3 && emptyEnds === 2) totalScore += 1000;  // 活3
      else if (count === 3 && emptyEnds === 1) totalScore += 100;   // 眠3
      else if (count === 2 && emptyEnds === 2) totalScore += 50;    // 活2
    }
    return totalScore;
  };

  // --- 落子通用处理 ---
  const handleMove = useCallback((index, player) => {
    const newBoard = [...board];
    newBoard[index] = player;

    // 记录历史
    setHistory(prev => [...prev, { board: [...board], isBlackNext, lastMoveIndex }]);
    setBoard(newBoard);
    setLastMoveIndex(index);

    if (checkWinner(newBoard, index, player)) {
      setWinner(player);
      Modal.success({
        title: '游戏结束',
        content: `${player === 'black' ? '黑棋(玩家)' : (gameMode === 'pve' ? '白棋(电脑)' : '白棋')} 获胜！`,
        okText: '再来一局',
        onOk: resetGame,
      });
    } else if (!newBoard.includes(null)) {
      Modal.info({ title: '平局', content: '棋盘已满', onOk: resetGame });
    } else {
      setIsBlackNext(prev => !prev);
    }
  }, [board, isBlackNext, lastMoveIndex, gameMode]);

  // --- 玩家点击处理 ---
  const handlePlayerClick = (index) => {
    // 1. 已有棋子、游戏结束、AI 正在思考、或者是 PvE 模式下轮到白棋时，禁止点击
    if (board[index] || winner || isAiThinking || (gameMode === 'pve' && !isBlackNext)) return;

    handleMove(index, isBlackNext ? 'black' : 'white');
  };

  // --- AI 自动落子 ---
  useEffect(() => {
    if (gameMode === 'pve' && !isBlackNext && !winner) {
      setIsAiThinking(true);
      // 延迟 1000ms 模拟思考，体验更好
      const timer = setTimeout(() => {
        const moveIndex = getBestMove(board);
        if (moveIndex !== -1) {
          handleMove(moveIndex, 'white');
        }
        setIsAiThinking(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isBlackNext, gameMode, winner, board, handleMove]);

  // 重置
  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setIsBlackNext(true);
    setWinner(null);
    setHistory([]);
    setLastMoveIndex(null);
    setIsAiThinking(false);
  };

  // 悔棋
  const undoMove = () => {
    if (history.length === 0 || winner || isAiThinking) return;

    let stepsToUndo = 1;
    // 如果是人机模式，玩家悔棋需要回退 2 步（回到玩家的上一步）
    // 除非只下了一步（这种边界情况由 history.length 处理）
    if (gameMode === 'pve' && history.length >= 2) {
      stepsToUndo = 2;
    }

    // 获取目标状态
    const targetStateIndex = history.length - stepsToUndo;
    // 如果是 PvE 且只有 1 步历史（轮到白棋还没下完就点悔棋，或者刚开局），只能退 1 步
    // 但正常逻辑是 AI 下得很快，所以一般是回退 2 步

    if (targetStateIndex < 0) {
      resetGame();
      return;
    }

    const targetState = history[targetStateIndex];
    setBoard(targetState.board);
    setIsBlackNext(targetState.isBlackNext);
    setLastMoveIndex(targetState.lastMoveIndex);
    setHistory(history.slice(0, targetStateIndex));
  };

  return (
    <div style={styles.container}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>React 五子棋</Title>
            {/* 模式切换 */}
            <Radio.Group
              value={gameMode}
              onChange={e => { setGameMode(e.target.value); resetGame(); }}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="pve"><RobotOutlined /> 人机对战</Radio.Button>
              <Radio.Button value="pvp"><UserOutlined /> 双人对战</Radio.Button>
            </Radio.Group>
          </div>
        }
        bordered={false}
        style={{ width: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Text strong>状态: </Text>
            {winner ? (
              <Tag color="red">游戏结束</Tag>
            ) : (
              <Tag color={isBlackNext ? 'black' : 'blue'}>
                {isAiThinking ? '电脑思考中...' : (isBlackNext ? '黑棋 (玩家)' : (gameMode === 'pve' ? '白棋 (电脑)' : '白棋 (玩家2)'))}
              </Tag>
            )}
          </div>

          <Space>
            <Button icon={<UndoOutlined />} onClick={undoMove} disabled={history.length === 0 || winner !== null || isAiThinking}>
              悔棋
            </Button>
            <Button type="primary" danger icon={<ReloadOutlined />} onClick={resetGame}>
              重置
            </Button>
          </Space>
        </Space>

        <div style={styles.board}>
          {board.map((cell, index) => (
            <div key={index} style={styles.cell} onClick={() => handlePlayerClick(index)}>
              {cell && (
                <div
                  style={{
                    ...styles.piece,
                    backgroundColor: cell === 'black' ? '#333' : '#fff',
                    border: cell === 'white' ? '1px solid #ccc' : 'none'
                  }}
                >
                  {index === lastMoveIndex && <div style={styles.lastMoveMarker} />}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 15, textAlign: 'center', color: '#999', fontSize: '12px' }}>
          {gameMode === 'pve' ? '你执黑棋先行，电脑执白棋后手' : '双人轮流落子'}
        </div>
      </Card>
    </div>
  );
};

export default Gomoku;