import React, { useState, useCallback, useEffect } from 'react';
import { Card, Typography, Tag, Button, Space, Radio, Divider, Row, Col, Select, Modal } from 'antd';
import { UserOutlined, RobotOutlined, ReloadOutlined, LoadingOutlined, TrophyOutlined, HistoryOutlined } from '@ant-design/icons';
import confetti from 'canvas-confetti';

const { Title, Text } = Typography;

// --- 核心配置 ---
const BOARD_SIZE = 4;
const MAX_NO_CAPTURE_TURNS = 30; // 连续20回合不吃子触发终局判断

// 棋子类型 (相克逻辑)
const PIECES_TYPE = {
    T: { name: '老虎', icon: '🐯', rank: 4 }, 
    C: { name: '公鸡', icon: '🐔', rank: 3 }, 
    B: { name: '虫子', icon: '🐛', rank: 2 }, 
    S: { name: '棒子', icon: '🥢', rank: 1 }, 
};

// 阵营配色
const PLAYER_CONFIG = {
    player1: { name: '红方', color: '#ff4d6d', bg: '#ffe6ea' },
    player2: { name: '蓝方', color: '#1890ff', bg: '#e6f7ff' }
};

const CustomStrategyGame = () => {
    // --- 状态管理 ---
    const [board, setBoard] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [humanPlayer, setHumanPlayer] = useState('player1');
    const [selectedCell, setSelectedCell] = useState(null);
    const [winner, setWinner] = useState(null); // 'player1' | 'player2' | 'DRAW'
    const [gameMode, setGameMode] = useState(null); 
    
    const [aiDifficulty, setAiDifficulty] = useState('MEDIUM');
    const [firstMove, setFirstMove] = useState('HUMAN');
    
    // 追踪每个玩家最后一步的详细信息，用于限制“立即移回”
    // 结构：{ player1: { from: [r,c], to: [nr,nc] }, player2: ... }
    const [lastMoves, setLastMoves] = useState({ player1: null, player2: null });
    const [noCaptureTurns, setNoCaptureTurns] = useState(0); // 吃子计数器
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [aiThinking, setAiThinking] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const initializeBoard = () => {
        const emptyBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        const types = ['T', 'C', 'B', 'S'];
        types.forEach((t, i) => { emptyBoard[3][i] = { type: t, player: 'player1' }; });
        [...types].reverse().forEach((t, i) => { emptyBoard[0][i] = { type: t, player: 'player2' }; });
        return emptyBoard;
    };

    const startGame = (mode) => {
        setGameMode(mode);
        setBoard(initializeBoard());
        setWinner(null);
        setLastMoves({ player1: null, player2: null });
        setNoCaptureTurns(0);
        setSelectedCell(null);

        if (mode === 'PvE') {
            if (firstMove === 'HUMAN') {
                setHumanPlayer('player1');
                setCurrentPlayer('player1');
            } else {
                setHumanPlayer('player2');
                setCurrentPlayer('player1');
            }
        } else {
            setHumanPlayer('player1');
            setCurrentPlayer('player1');
        }
    };

    const canCapture = (atkType, defType) => {
        if (atkType === 'T' && defType === 'C') return true;
        if (atkType === 'C' && defType === 'B') return true;
        if (atkType === 'B' && defType === 'S') return true;
        if (atkType === 'S' && defType === 'T') return true;
        return false;
    };

    // --- 核心逻辑优化：禁止立即返回上一个位置 ---
    const getValidMoves = useCallback((currentBoard, r, c, player, playerHistory) => {
        const piece = currentBoard[r][c];
        if (!piece || piece.player !== player) return [];

        const moves = [];
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        
        // 获取该玩家上一次移动的信息
        const history = playerHistory || lastMoves[player];

        directions.forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                const target = currentBoard[nr][nc];
                
                // 1. 基础移动/吃子逻辑
                const canMoveTo = !target || (target.player !== player && canCapture(piece.type, target.type));
                
                if (canMoveTo) {
                    // 2. 限制逻辑：不能立即移回上一回合离开的位置
                    // 如果这次移动的目的地(nr, nc) 正是上次移动的起点(from)，且现在的起点是上次的终点
                    if (history && 
                        history.to[0] === r && history.to[1] === c && 
                        history.from[0] === nr && history.from[1] === nc) {
                        return; // 禁止反复横跳
                    }
                    moves.push([nr, nc]);
                }
            }
        });
        return moves;
    }, [lastMoves]);

    const countPieces = (currentBoard, player) => {
        let count = 0;
        currentBoard.forEach(row => row.forEach(cell => {
            if (cell && cell.player === player) count++;
        }));
        return count;
    };

    // --- 终局判断逻辑 ---
    const checkGameOver = (newBoard, nextPlayer, captureOccurred) => {
        const p1Count = countPieces(newBoard, 'player1');
        const p2Count = countPieces(newBoard, 'player2');

        // 1. 某一方被吃光
        if (p1Count === 0) return 'player2';
        if (p2Count === 0) return 'player1';

        // 2. 连续无吃子规则
        const updatedNoCaptureTurns = captureOccurred ? 0 : noCaptureTurns + 1;
        setNoCaptureTurns(updatedNoCaptureTurns);

        if (updatedNoCaptureTurns >= MAX_NO_CAPTURE_TURNS) {
            if (p1Count > p2Count) return 'player1';
            if (p2Count > p1Count) return 'player2';
            return 'DRAW';
        }

        // 3. 无路可走判断
        let hasMove = false;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (newBoard[r][c]?.player === nextPlayer) {
                    if (getValidMoves(newBoard, r, c, nextPlayer).length > 0) {
                        hasMove = true;
                        break;
                    }
                }
            }
        }
        if (!hasMove) return nextPlayer === 'player1' ? 'player2' : 'player1';

        return null;
    };

    // --- AI 逻辑 ---
    const evaluateBoard = (currentBoard, myPlayer) => {
        const oppPlayer = myPlayer === 'player1' ? 'player2' : 'player1';
        let score = (countPieces(currentBoard, myPlayer) - countPieces(currentBoard, oppPlayer)) * 1000;
        return score;
    };

    const minimax = (currentBoard, depth, isMax, alpha, beta, aiPlayer, history) => {
        const oppPlayer = aiPlayer === 'player1' ? 'player2' : 'player1';
        const turnPlayer = isMax ? aiPlayer : oppPlayer;

        if (depth === 0) return evaluateBoard(currentBoard, aiPlayer);

        let allMoves = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c]?.player === turnPlayer) {
                    // AI模拟时也需要考虑历史限制
                    const moves = getValidMoves(currentBoard, r, c, turnPlayer, history[turnPlayer]);
                    moves.forEach(([nr, nc]) => allMoves.push({ r, c, nr, nc }));
                }
            }
        }

        if (allMoves.length === 0) return isMax ? -90000 : 90000;

        let bestVal = isMax ? -Infinity : Infinity;
        for (let move of allMoves) {
            const nextBoard = currentBoard.map(row => [...row]);
            nextBoard[move.nr][move.nc] = nextBoard[move.r][move.c];
            nextBoard[move.r][move.c] = null;

            // 更新模拟的历史记录
            const nextHistory = { ...history, [turnPlayer]: { from: [move.r, move.c], to: [move.nr, move.nc] } };
            const value = minimax(nextBoard, depth - 1, !isMax, alpha, beta, aiPlayer, nextHistory);

            if (isMax) {
                bestVal = Math.max(bestVal, value);
                alpha = Math.max(alpha, value);
            } else {
                bestVal = Math.min(bestVal, value);
                beta = Math.min(beta, value);
            }
            if (beta <= alpha) break;
        }
        return bestVal;
    };

    const runAiTurn = useCallback(async () => {
        if (winner) return;
        setAiThinking(true);
        await new Promise(r => setTimeout(r, 600));

        const aiPlayer = currentPlayer;
        const depth = aiDifficulty === 'EASY' ? 2 : (aiDifficulty === 'MEDIUM' ? 3 : 5);
        
        let bestScore = -Infinity;
        let bestMoves = [];

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c]?.player === aiPlayer) {
                    const moves = getValidMoves(board, r, c, aiPlayer);
                    for (let [nr, nc] of moves) {
                        const nextBoard = board.map(row => [...row]);
                        nextBoard[nr][nc] = nextBoard[r][c];
                        nextBoard[r][c] = null;
                        
                        const simHistory = { ...lastMoves, [aiPlayer]: { from: [r, c], to: [nr, nc] } };
                        const score = minimax(nextBoard, depth - 1, false, -Infinity, Infinity, aiPlayer, simHistory);

                        if (score > bestScore) {
                            bestScore = score;
                            bestMoves = [{ start: [r, c], end: [nr, nc] }];
                        } else if (score === bestScore) {
                            bestMoves.push({ start: [r, c], end: [nr, nc] });
                        }
                    }
                }
            }
        }

        setAiThinking(false);
        if (bestMoves.length > 0) {
            const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            movePiece(move.start[0], move.start[1], move.end[0], move.end[1]);
        } else {
            setWinner(aiPlayer === 'player1' ? 'player2' : 'player1');
        }
    }, [board, currentPlayer, winner, aiDifficulty, getValidMoves, lastMoves]);

    // --- 执行移动 ---
    const movePiece = (r, c, nr, nc) => {
        const captureOccurred = board[nr][nc] !== null;
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[r][c];
        newBoard[nr][nc] = piece;
        newBoard[r][c] = null;
        
        setBoard(newBoard);
        setLastMoves(prev => ({ ...prev, [currentPlayer]: { from: [r, c], to: [nr, nc] } }));

        const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
        const gameResult = checkGameOver(newBoard, nextPlayer, captureOccurred);
        
        if (gameResult) {
            setWinner(gameResult);
            if (gameResult !== 'DRAW') fireWinConfetti();
        } else {
            setCurrentPlayer(nextPlayer);
        }
        setSelectedCell(null);
    };

    const handleCellClick = (r, c) => {
        if (winner || aiThinking) return;
        if (gameMode === 'PvE' && currentPlayer !== humanPlayer) return;

        const cell = board[r][c];
        if (selectedCell) {
            const [sr, sc] = selectedCell;
            const validMoves = getValidMoves(board, sr, sc, currentPlayer);
            if (validMoves.some(([nr, nc]) => nr === r && nc === c)) {
                movePiece(sr, sc, r, c);
                return;
            }
        }

        if (cell && cell.player === currentPlayer) {
            setSelectedCell([r, c]);
        } else {
            setSelectedCell(null);
        }
    };

    useEffect(() => {
        if (gameMode === 'PvE' && currentPlayer && currentPlayer !== humanPlayer) {
            runAiTurn();
        }
    }, [currentPlayer, gameMode, humanPlayer, runAiTurn]);

    const fireWinConfetti = () => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    };

    const renderCell = (r, c) => {
        const cell = board[r][c];
        const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
        const moves = selectedCell ? getValidMoves(board, selectedCell[0], selectedCell[1], currentPlayer) : [];
        const isValidTarget = moves.some(([nr, nc]) => nr === r && nc === c);

        return (
            <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                    position: 'relative',
                    background: (r + c) % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                    borderRadius: 8,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 0 0 3px ${PLAYER_CONFIG[currentPlayer].color}` : 'none',
                    transition: 'all 0.2s',
                    border: isValidTarget ? '2px dashed #52c41a' : 'none'
                }}
            >
                {cell && (
                    <div style={{
                        width: '80%', height: '80%', borderRadius: '50%',
                        background: PLAYER_CONFIG[cell.player].color,
                        color: '#fff',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        fontSize: isMobile ? '18px' : '24px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    }}>
                        <span style={{ lineHeight: 1 }}>{PIECES_TYPE[cell.type].icon}</span>
                        {!isMobile && <span style={{ fontSize: 10, marginTop: -2 }}>{PIECES_TYPE[cell.type].name}</span>}
                    </div>
                )}
                {isValidTarget && !cell && (
                    <div style={{ width: 12, height: 12, background: '#52c41a', borderRadius: '50%', opacity: 0.6 }} />
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: isMobile ? 10 : 30, background: '#fff0f6', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
            <Card
                title={<div style={{ textAlign: 'center' }}><Title level={isMobile ? 4 : 3} style={{ color: '#ff4d6d', margin: 0 }}>斗兽棋大乱斗 🐯</Title></div>}
                extra={gameMode && <Button onClick={() => setGameMode(null)} icon={<ReloadOutlined />}>重置</Button>}
                style={{ width: '100%', maxWidth: 600, borderRadius: 16, boxShadow: '0 8px 24px rgba(255, 77, 109, 0.15)' }}
            >
                {!gameMode ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <Title level={5}>难度与先手</Title>
                        <Space direction="vertical" style={{ marginBottom: 20 }}>
                            <Radio.Group value={firstMove} onChange={e => setFirstMove(e.target.value)} buttonStyle="solid">
                                <Radio.Button value="HUMAN">🙋‍♀️ 我先手</Radio.Button>
                                <Radio.Button value="AI">🤖 电脑先手</Radio.Button>
                            </Radio.Group>
                            <Radio.Group value={aiDifficulty} onChange={e => setAiDifficulty(e.target.value)}>
                                <Radio value="EASY">萌新</Radio>
                                <Radio value="MEDIUM">普通</Radio>
                                <Radio value="HARD">大师</Radio>
                            </Radio.Group>
                        </Space>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Button type="primary" size="large" block onClick={() => startGame('PvE')} style={{ height: 50, borderRadius: 25, fontSize: 18, background: '#ff4d6d' }}>
                                <RobotOutlined /> 开始人机对战
                            </Button>
                            <Button size="large" block onClick={() => startGame('PvP')} style={{ height: 50, borderRadius: 25 }}>
                                <UserOutlined /> 双人同屏对战
                            </Button>
                        </Space>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Tag color={currentPlayer === 'player1' ? '#ff4d6d' : 'default'} style={{ padding: '4px 12px' }}>
                                红方: {countPieces(board, 'player1')}
                            </Tag>
                            <div style={{ textAlign: 'center' }}>
                                <HistoryOutlined /> {noCaptureTurns}/{MAX_NO_CAPTURE_TURNS}
                            </div>
                            <Tag color={currentPlayer === 'player2' ? '#1890ff' : 'default'} style={{ padding: '4px 12px' }}>
                                蓝方: {countPieces(board, 'player2')}
                            </Tag>
                        </div>

                        {winner && (
                            <div style={{ textAlign: 'center', marginBottom: 16, padding: 10, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                                <TrophyOutlined style={{ color: '#faad14', fontSize: 24 }} />
                                <Text strong style={{ fontSize: 16, marginLeft: 8 }}>
                                    {winner === 'DRAW' ? '握手言和，平局！🤝' : `${PLAYER_CONFIG[winner].name} 获胜！🎉`}
                                </Text>
                            </div>
                        )}

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                            gap: 8, padding: 12, background: '#ffd6e7', borderRadius: 12,
                            aspectRatio: '1/1', maxWidth: 400, margin: '0 auto'
                        }}>
                            {board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
                        </div>

                        <Divider style={{ margin: '20px 0' }} />
                        <Row justify="center" gutter={[8, 8]} style={{ fontSize: '12px' }}>
                            <Col><Tag color="#f5222d">虎 🐯 &gt; 鸡 🐔</Tag></Col>
                            <Col><Tag color="#faad14">鸡 🐔 &gt; 虫 🐛</Tag></Col>
                            <Col><Tag color="#52c41a">虫 🐛 &gt; 棒 🥢</Tag></Col>
                            <Col><Tag color="#1890ff">棒 🥢 &gt; 虎 🐯</Tag></Col>
                        </Row>
                        <div style={{ textAlign: 'center', marginTop: 10 }}>
                           <Text type="secondary" size="small">规则：不能立即移回上一位置。20步不吃子按余子数判胜。</Text>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CustomStrategyGame;