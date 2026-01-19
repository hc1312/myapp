import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Modal, Radio } from 'antd';

const { Title, Text } = Typography;

/* ================= 基础配置 ================= */
const SIZE = 6;
const OBSTACLE_COUNT = 4;
const TRAP_COUNT = 3;

const PIECES = ['T', 'C', 'B', 'S'];
const PIECE_NAME = {
  T: '虎',
  C: '鸡',
  B: '虫',
  S: '棒',
};

const CAN_CAPTURE = {
  T: 'C',
  C: 'B',
  B: 'S',
  S: 'T',
};

const inBoard = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;
const cloneBoard = (b) => b.map(row => row.map(cell => cell ? { ...cell } : cell));

const randomEmpty = (board) => {
  let tries = 0;
  while (tries++ < 300) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (!board[r][c]) return [r, c];
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return [r, c];
    }
  }
};

const initBoard = () => {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

  for (let i = 0; i < OBSTACLE_COUNT; i++) {
    const [r, c] = randomEmpty(board);
    board[r][c] = { terrain: 'obstacle' };
  }

  for (let i = 0; i < TRAP_COUNT; i++) {
    const [r, c] = randomEmpty(board);
    board[r][c] = { terrain: 'trap' };
  }

  const place = (player, rows) => {
    let placed = 0;
    while (placed < 8) {
      const r = rows[Math.floor(Math.random() * rows.length)];
      const c = Math.floor(Math.random() * SIZE);
      if (!board[r][c]) {
        board[r][c] = {
          type: PIECES[placed % 4],
          player,
        };
        placed++;
      }
    }
  };

  place('P1', [0, 1]);
  place('P2', [4, 5]);

  return board;
};

/* ================= 主组件 ================= */
export default function TerrainRPSGame() {
  const [board, setBoard] = useState(initBoard);
  const [current, setCurrent] = useState('P1');
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('PvE');
  const [winner, setWinner] = useState(null);

  /* ================= 合法移动 ================= */
  const getMoves = (b, r, c) => {
    const cell = b[r][c];
    if (!cell?.type) return [];

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const res = [];

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (!inBoard(nr, nc)) continue;

      const target = b[nr][nc];
      if (target?.terrain === 'obstacle') continue;

      if (target?.terrain === 'trap') {
        res.push([nr, nc]);
        continue;
      }

      if (!target) {
        res.push([nr, nc]);
      } else if (
        target.player !== cell.player &&
        CAN_CAPTURE[cell.type] === target.type
      ) {
        res.push([nr, nc]);
      }
    }
    return res;
  };

  const possibleMoves = selected
    ? getMoves(board, selected[0], selected[1])
    : [];

  /* ================= AI ================= */
  const aiMove = () => {
    let best = null;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = board[r][c];
        if (cell?.player === 'P2') {
          const moves = getMoves(board, r, c);
          for (const [nr, nc] of moves) {
            const target = board[nr][nc];
            let score = 0;
            if (target?.type) score += 100;
            if (target?.terrain === 'trap') score -= 50;

            if (!best || score > best.score) {
              best = { r, c, nr, nc, score };
            }
          }
        }
      }
    }

    if (best) {
      applyMove(best.r, best.c, best.nr, best.nc);
    } else {
      endGame('P1');
    }
  };

  /* ================= 执行移动 ================= */
  const applyMove = (r, c, nr, nc) => {
    const newBoard = cloneBoard(board);
    const moving = newBoard[r][c];
    newBoard[r][c] = null;

    if (newBoard[nr][nc]?.terrain !== 'trap') {
      newBoard[nr][nc] = moving;
    }

    setBoard(newBoard);
    setSelected(null);

    const other = moving.player === 'P1' ? 'P2' : 'P1';
    const remain = newBoard.flat().filter(
      x => x?.player === other && x.type
    ).length;

    if (remain === 0) {
      endGame(moving.player);
    } else {
      setCurrent(other);
    }
  };

  const endGame = (p) => {
    setWinner(p);
    Modal.success({
      title: '游戏结束',
      content: `${p === 'P1' ? '玩家一' : '玩家二 / AI'} 获胜！`,
    });
  };

  useEffect(() => {
    if (mode === 'PvE' && current === 'P2' && !winner) {
      const t = setTimeout(aiMove, 600);
      return () => clearTimeout(t);
    }
  }, [current, board, mode, winner]);

  /* ================= 渲染 ================= */
  const renderPiece = (cell) => {
    if (!cell?.type) return null;
    const isP1 = cell.player === 'P1';
    return (
      <div
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          background: isP1 ? '#111' : '#fff',
          color: isP1 ? '#fff' : '#111',
          border: isP1 ? 'none' : '1px solid #999',
          fontWeight: 600,
        }}
      >
        {PIECE_NAME[cell.type]}
      </div>
    );
  };

  const renderCell = (r, c) => {
    const cell = board[r][c];
    const isSel = selected?.[0] === r && selected?.[1] === c;

    const isMoveTarget = possibleMoves.some(
      ([mr, mc]) => mr === r && mc === c
    );

    const isCapture =
      isMoveTarget &&
      cell?.type &&
      cell.player !== board[selected?.[0]]?.[selected?.[1]]?.player;

    const isTrapTarget =
      isMoveTarget && cell?.terrain === 'trap';

    let bg = '#eee';
    if (cell?.terrain === 'obstacle') bg = '#555';
    if (cell?.terrain === 'trap') bg = '#ffb3b0';
    if (isMoveTarget) bg = '#cce5ff';
    if (isCapture) bg = '#ffd6d6';
    if (isTrapTarget) bg = '#ff9c9c';

    return (
      <div
        key={`${r}-${c}`}
        onClick={() => {
          if (winner) return;
          if (!selected) {
            if (cell?.player === current) setSelected([r, c]);
          } else {
            const [sr, sc] = selected;
            if (possibleMoves.some(([x,y]) => x === r && y === c)) {
              applyMove(sr, sc, r, c);
            } else {
              setSelected(null);
            }
          }
        }}
        style={{
          width: 70,
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          border: isSel ? '3px solid #1890ff' : '1px solid #999',
          cursor: 'pointer',
        }}
      >
        {renderPiece(cell)}
      </div>
    );
  };

  return (
    <Card
      title={<Title level={3}>♻️ 循环相克 · 地形版</Title>}
      extra={
        <Radio.Group value={mode} onChange={e => setMode(e.target.value)}>
          <Radio.Button value="PvP">PvP</Radio.Button>
          <Radio.Button value="PvE">PvE</Radio.Button>
        </Radio.Group>
      }
    >
      <Text>当前回合：{current === 'P1' ? '玩家一' : '玩家二 / AI'}</Text>

      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 70px)`,
        }}
      >
        {board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
      </div>

      <Button
        style={{ marginTop: 16 }}
        onClick={() => {
          setBoard(initBoard());
          setCurrent('P1');
          setWinner(null);
          setSelected(null);
        }}
      >
        重新开始
      </Button>
    </Card>
  );
}
