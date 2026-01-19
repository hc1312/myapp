import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, Typography, Button, Space, notification, Tag, Modal, Spin } from 'antd';
import { UserOutlined, ArrowLeftOutlined, ArrowRightOutlined, TrophyOutlined, CloseCircleOutlined, PlusOutlined, RobotOutlined, TeamOutlined } from '@ant-design/icons';
import ReactDice, { ReactDiceRef } from "react-dice-complete";

const { Title, Text } = Typography;

// --- 核心常量 (保持不变) ---
const BOARD_SIZE = 12;
const INITIAL_PIECES = 5;
const PIECE_HEIGHT = 20; 

const STYLES = {
    container: { 
        padding: 20, 
        background: '#f0f2f5', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        alignItems: 'center' 
    },
    card: { 
        width: '90%', 
        maxWidth: 1000, 
        marginBottom: 20, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
    },
    boardGrid: { 
        display: 'grid', 
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, 
        gap: '0px', 
        width: '100%' 
    },
    stackContainerBase: {
        position: 'relative',
        width: '100%',
        minHeight: `${PIECE_HEIGHT * 2}px`, 
        cursor: 'default',
    },
    pieceBase: {
        width: '100%',
        height: `${PIECE_HEIGHT}px`,
        border: '1px solid',
        borderRadius: '4px',
        textAlign: 'center',
        lineHeight: `${PIECE_HEIGHT - 2}px`,
        fontSize: '12px',
        position: 'absolute',
        left: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    },
    diceContainer: {
        width: '50px',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    }
};

// --- 辅助函数 (保持不变) ---

const getHomeBaseIndex = (player) => (player === 'player1' ? 0 : BOARD_SIZE - 1);
const getEnemyBaseIndex = (player) => (player === 'player1' ? BOARD_SIZE - 1 : 0);
const getOpponent = (player) => (player === 'player1' ? 'player2' : 'player1');
const getHomeDirection = (player) => (player === 'player1' ? -1 : 1);

const initializeBoard = () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => []);
    
    for (let i = 1; i <= INITIAL_PIECES; i++) {
        board[0].push({
            id: `P1-${i}`,
            player: 'player1',
            direction: 1, 
            captives: [],
        });
    }

    for (let i = 1; i <= INITIAL_PIECES; i++) {
        board[BOARD_SIZE - 1].push({
            id: `P2-${i}`,
            player: 'player2',
            direction: -1, 
            captives: [],
        });
    }
    return board;
};

const CaptiveChessGame = () => {
    const [board, setBoard] = useState(initializeBoard());
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [diceRoll, setDiceRoll] = useState(0);
    const [selectedStackIndex, setSelectedStackIndex] = useState(null);
    const [winner, setWinner] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [eliminatedPieces, setEliminatedPieces] = useState([]);
    
    const [gameMode, setGameMode] = useState(null); // 'AI_VS_HUMAN' 或 'HUMAN_VS_HUMAN'
    const isAITurn = useMemo(() => gameMode === 'AI_VS_HUMAN' && currentPlayer === 'player2', [gameMode, currentPlayer]);

    // 【新增状态】记录上一次移动的终点
    const [lastMoveInfo, setLastMoveInfo] = useState({ index: null, pieceId: null });

    const diceRef = useRef(null);
    const turnCompleteRef = useRef(true); 

    // --- 游戏规则函数 (getValidMoves 保持不变) ---
    const checkWin = useCallback((currentEliminatedPieces, currentTurnPlayer) => {
        const opponent = getOpponent(currentTurnPlayer);
        const opponentPrefix = opponent === 'player1' ? 'P1' : 'P2';
        const opponentEliminatedCount = currentEliminatedPieces.filter(id => id.startsWith(opponentPrefix)).length;
        
        if (opponentEliminatedCount === INITIAL_PIECES) {
            setWinner(currentTurnPlayer);
            Modal.success({
                title: '游戏结束！',
                content: `恭喜 ${currentTurnPlayer === 'player1' ? '玩家一 (黑棋)' : (gameMode === 'AI_VS_HUMAN' ? 'AI (白棋)' : '玩家二 (白棋)')} 获胜，已俘虏所有敌方棋子！`,
                okText: '再玩一局',
                onOk: () => {
                    setGameStarted(false); 
                    setGameMode(null);
                }
            });
            return true;
        }
        return false;
    }, [gameMode]);

    const getValidMoves = useCallback((currentRoll, player, currentBoard) => {
        if (currentRoll === 0 || winner) return [];
        const validMoves = [];
        const homeBaseIndex = getHomeBaseIndex(player);
        const enemyBaseIndex = getEnemyBaseIndex(player);

        for (let i = 0; i < BOARD_SIZE; i++) {
            const stack = currentBoard[i];
            if (stack.length > 0 && stack[0].player === player) {
                const movingPiece = stack[0];
                const direction = movingPiece.direction;
                
                // 1. 大本营回归规则 (Overshoot to Home Base):
                if (movingPiece.captives.length > 0) {
                    const stepsToHome = Math.abs(homeBaseIndex - i);
                    if (currentRoll >= stepsToHome && direction === getHomeDirection(player)) {
                        validMoves.push({ startIndex: i, endIndex: homeBaseIndex, type: 'RELEASE', piece: movingPiece });
                        continue;
                    }
                }

                const newIndex = i + currentRoll * direction;

                // 2. 检查越界和敌方大本营:
                const isOvershootingEnemyBase = 
                    (player === 'player1' && newIndex > enemyBaseIndex) ||
                    (player === 'player2' && newIndex < enemyBaseIndex);

                if (newIndex === enemyBaseIndex || isOvershootingEnemyBase) {
                    if (movingPiece.captives.length === 0) {
                        validMoves.push({ startIndex: i, endIndex: i, type: 'REVERSE_ONLY', piece: movingPiece });
                        continue;
                    }
                    continue; 
                }
                
                // 3. 检查自我占领（非大本营）
                const targetStack = currentBoard[newIndex];
                const isTargetHomeBase = newIndex === homeBaseIndex;
                
                if (targetStack.length > 0 && targetStack[0].player === player && !isTargetHomeBase) {
                    continue; 
                }
                
                // 4. 目标格子上有对方棋子 (捕获) 或为空 (NORMAL)
                validMoves.push({ 
                    startIndex: i, 
                    endIndex: newIndex, 
                    type: targetStack.length > 0 ? 'CAPTURE' : 'NORMAL',
                    piece: movingPiece
                });
            }
        }
        return validMoves;
    }, [winner]);
    
    // --- 游戏流程与 AI 调度 ---
    
    const startGame = useCallback((mode) => {
        setBoard(initializeBoard());
        setCurrentPlayer('player1');
        setDiceRoll(0);
        setSelectedStackIndex(null);
        setWinner(null);
        setEliminatedPieces([]);
        setGameMode(mode); 
        setGameStarted(true);
        turnCompleteRef.current = true;
        setLastMoveInfo({ index: null, pieceId: null }); // 重置高亮状态
        notification.success({ 
            message: '游戏开始!', 
            description: `模式：${mode === 'AI_VS_HUMAN' ? '人机对战' : '双人对战'}。玩家一 (黑棋) 先手，请投掷骰子。` 
        });
    }, []);


    // 实际执行移动的内部函数
    const executeMove = useCallback((move) => {
        const currentTurnPlayer = currentPlayer;
        const newBoard = board.map(row => row.slice());
        const originalStack = newBoard[move.startIndex];
        const movingPiece = originalStack[0];
        
        let newCaptives = [...movingPiece.captives];
        let newDirection = movingPiece.direction;
        let newEliminatedPieces = [...eliminatedPieces];
        let piecesToReturnHome = []; 
        const homeBaseIndex = getHomeBaseIndex(currentTurnPlayer);

        // ... (executeMove 逻辑保持不变) ...
        // 1. REVERSE_ONLY
        if (move.type === 'REVERSE_ONLY') {
            newDirection = getHomeDirection(currentTurnPlayer); 
            const updatedPiece = { ...movingPiece, direction: newDirection, captives: newCaptives };
            newBoard[move.startIndex][0] = updatedPiece;
            
        // 2. RELEASE
        } else if (move.type === 'RELEASE') {
            const piecesToRelease = newCaptives;
            newCaptives = []; 
            
            piecesToReturnHome = [movingPiece, ...piecesToRelease.filter(p => p.player === currentTurnPlayer)];
            
            const piecesEliminated = piecesToRelease.filter(p => p.player !== currentTurnPlayer).map(p => p.id);
            newEliminatedPieces.push(...piecesEliminated);
            
            newBoard[move.startIndex] = originalStack.slice(1); 
            
            newBoard[homeBaseIndex].push(...piecesToReturnHome.map(p => ({
                id: p.id,
                player: p.player,
                direction: homeBaseIndex === 0 ? 1 : -1, 
                captives: []
            })));

        // 3. NORMAL 或 CAPTURE
        } else { 
            
            if (move.type === 'CAPTURE') {
                const targetStack = newBoard[move.endIndex];
                
                targetStack.reverse().forEach(capturedPiece => {
                    if (capturedPiece.player !== movingPiece.player) {
                        newCaptives.push(capturedPiece);
                        
                        capturedPiece.captives.reverse().forEach(captiveOfCaptured => {
                            if (captiveOfCaptured.player === currentTurnPlayer) {
                                piecesToReturnHome.push(captiveOfCaptured);
                            } else {
                                newCaptives.push(captiveOfCaptured);
                            }
                        });
                        capturedPiece.captives = []; 
                    } else {
                        newCaptives.push(capturedPiece); 
                    }
                });

                newBoard[move.endIndex] = []; 
                newDirection = getHomeDirection(currentTurnPlayer); 
            }
            
            newBoard[move.startIndex] = originalStack.slice(1); 
            
            const newMovingPiece = {
                ...movingPiece,
                direction: newDirection,
                captives: newCaptives
            };
            
            newBoard[move.endIndex].unshift(newMovingPiece);
            
            if (piecesToReturnHome.length > 0) {
                newBoard[homeBaseIndex].push(...piecesToReturnHome.map(p => ({
                    id: p.id,
                    player: p.player,
                    direction: homeBaseIndex === 0 ? 1 : -1, 
                    captives: []
                })));
            }
        }
        
        // **状态更新和回合切换**
        setBoard(newBoard);
        setDiceRoll(0);
        setSelectedStackIndex(null);
        setEliminatedPieces(newEliminatedPieces);
        
        // 【新增】：记录上一次移动的终点，用于 UI 高亮
        if (move.type === 'RELEASE') {
             setLastMoveInfo({ index: homeBaseIndex, pieceId: movingPiece.id });
        } else if (move.type !== 'REVERSE_ONLY') {
            setLastMoveInfo({ index: move.endIndex, pieceId: movingPiece.id });
        } else {
             // REVERSE_ONLY 不改变位置，清除高亮
             setLastMoveInfo({ index: null, pieceId: null }); 
        }

        const isWin = checkWin(newEliminatedPieces, currentTurnPlayer);

        if (!isWin) {
            const nextPlayer = getOpponent(currentTurnPlayer);
            setCurrentPlayer(nextPlayer);
            
            const messageMap = {
                'RELEASE': '俘虏释放成功！',
                'CAPTURE': '捕获成功！',
                'REVERSE_ONLY': '方向调整！',
                'NORMAL': '移动成功。'
            };
            const playerLabel = currentTurnPlayer === 'player1' ? '玩家一' : (gameMode === 'AI_VS_HUMAN' ? 'AI' : '玩家二');
             notification.success({ 
                message: `${playerLabel} 移动完成 (${messageMap[move.type]})`, 
                description: `下回合：${nextPlayer === 'player1' ? '玩家一' : (gameMode === 'AI_VS_HUMAN' ? 'AI' : '玩家二')}。` 
            });
        }

        turnCompleteRef.current = true; 
        
    }, [board, currentPlayer, eliminatedPieces, checkWin, gameMode]);
    
    // 玩家移动入口
    const handleMove = useCallback(() => {
        if (selectedStackIndex === null || diceRoll === 0 || winner || isAITurn) return;

        // **修复：使用 useMemo 缓存的 allValidMoves**
        const move = allValidMoves.find(m => m.startIndex === selectedStackIndex);

        if (!move) {
            notification.error({ message: '非法移动', description: '请选择一个合法的棋子。' });
            return;
        }

        turnCompleteRef.current = false;
        executeMove(move);

    }, [selectedStackIndex, diceRoll, winner, isAITurn, executeMove]); // allValidMoves 是 useMemo 定义，引用无问题


    // --- AI 逻辑 (selectAIMove 保持不变) ---

    const selectAIMove = useCallback((validMoves, currentBoard, player) => {
        
        const releaseMoves = validMoves.filter(m => m.type === 'RELEASE');
        if (releaseMoves.length > 0) {
            return releaseMoves.sort((a, b) => b.piece.captives.length - a.piece.captives.length)[0];
        }

        const captureMoves = validMoves.filter(m => m.type === 'CAPTURE');
        if (captureMoves.length > 0) {
            return captureMoves.sort((a, b) => {
                const targetStackA = currentBoard[a.endIndex];
                const targetStackB = currentBoard[b.endIndex];
                return targetStackB.length - targetStackA.length;
            })[0];
        }

        const normalMoves = validMoves.filter(m => m.type === 'NORMAL');
        if (normalMoves.length > 0) {
            const homeBaseIndex = getHomeBaseIndex(player);
            
            return normalMoves.sort((a, b) => {
                const distA = Math.abs(homeBaseIndex - a.endIndex);
                const distB = Math.abs(homeBaseIndex - b.endIndex);
                return distA - distB;
            })[0];
        }
        
        const reverseMoves = validMoves.filter(m => m.type === 'REVERSE_ONLY');
        if (reverseMoves.length > 0) {
            return reverseMoves[0]; 
        }

        return null;

    }, []);

    // **修复：AITurn 不再依赖 allValidMoves**
    const AITurn = useCallback((roll) => {
        const aiPlayer = 'player2';
        
        // 1. 直接调用 getValidMoves 获取最新移动列表
        const validMoves = getValidMoves(roll, aiPlayer, board);

        if (validMoves.length === 0) {
            notification.warning({ 
                message: 'AI 无法移动', 
                description: `点数 ${roll} 无法使 AI 移动。跳过回合。` 
            });
            setDiceRoll(0);
            setCurrentPlayer('player1');
            turnCompleteRef.current = true;
            return;
        }

        // 2. 选择最佳移动
        const bestMove = selectAIMove(validMoves, board, aiPlayer);
        
        // 3. 延迟执行移动
        setTimeout(() => {
            // 从当前计算出的 validMoves 列表中查找匹配的移动对象
            const move = validMoves.find(m => m.startIndex === bestMove.startIndex && m.type === bestMove.type);
            if (move) {
                executeMove(move);
            }
        }, 1200); 

    }, [board, getValidMoves, selectAIMove, executeMove]); // 移除 allValidMoves 依赖

    // 骰子掷出处理 (已修复 player1 无法移动卡死 Bug)
    const onDiceRoll = useCallback((total, values) => {
        if (winner) return;
        const roll = values[0];
        setDiceRoll(roll);
        
        // 玩家投掷骰子后，清除上次移动的高亮
        setLastMoveInfo({ index: null, pieceId: null }); 
        
        if (currentPlayer === 'player2' && gameMode === 'AI_VS_HUMAN') {
            AITurn(roll);
        } else {
             const possibleMoves = getValidMoves(roll, currentPlayer, board);
             if (possibleMoves.length === 0) {
                 notification.warning({ 
                     message: '无法移动', 
                     description: `点数 ${roll} 无法使任何棋子移动。跳过本回合。` 
                 });
                 setDiceRoll(0);
                 setCurrentPlayer(getOpponent(currentPlayer));
                 // 【修复】：确保回合标志位重置，允许下一玩家投掷骰子
                 turnCompleteRef.current = true;
             }
        }
    }, [currentPlayer, board, winner, getValidMoves, AITurn, gameMode]);

    const rollDiceAndStartTurn = () => {
        if (diceRoll !== 0 || winner || !diceRef.current || !turnCompleteRef.current) return;
        turnCompleteRef.current = false; 
        diceRef.current.rollAll();
    };

    // --- useEffect 监听 AI 回合启动 (保持不变) ---
    useEffect(() => {
        if (gameStarted && currentPlayer === 'player2' && gameMode === 'AI_VS_HUMAN' && turnCompleteRef.current && !winner) {
            setTimeout(rollDiceAndStartTurn, 500);
        }
    }, [currentPlayer, gameStarted, winner, gameMode]);

    // 缓存所有合法移动及其起始索引 (供玩家回合使用)
    const allValidMoves = useMemo(() => getValidMoves(diceRoll, currentPlayer, board), [getValidMoves, diceRoll, currentPlayer, board]);
    
    const validStartIndices = useMemo(() => {
        return new Set(allValidMoves.map(m => m.startIndex));
    }, [allValidMoves]);
    
    const selectedMove = useMemo(() => {
        if (selectedStackIndex === null) return null;
        return allValidMoves.find(m => m.startIndex === selectedStackIndex);
    }, [allValidMoves, selectedStackIndex]);


    // --- 渲染辅助 (新增高亮逻辑) ---
    
    const renderPieceStack = (stack, index) => {
        if (stack.length === 0) return null;
        const topPiece = stack[0];
        
        const isSelected = selectedStackIndex === index;
        const isCurrentPlayer = topPiece.player === currentPlayer;
        const isMovable = isCurrentPlayer && diceRoll !== 0 && validStartIndices.has(index) && !isAITurn;
        
        const renderStackPiece = (piece, isTop = false, offset = 0) => {
            const piecePlayer = piece.player;
            const bgColor = piecePlayer === 'player1' ? '#404040' : '#d9d9d9';
            const textColor = piecePlayer === 'player1' ? 'white' : 'black';
            const borderColor = piecePlayer === 'player1' ? '#262626' : '#bfbfbf';
            
            // 检查这是否是上次移动的棋子 (只检查顶层棋子)
            const isLastMovedPiece = isTop && lastMoveInfo.pieceId === piece.id;

            const baseStyle = {
                ...STYLES.pieceBase,
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                top: `${offset}px`,
                zIndex: isTop ? 10 : (10 - offset),
                transition: 'box-shadow 0.3s ease', 
            };
            
            if (isTop) {
                let borderStyle = '1px solid #000';
                if (isSelected) {
                     borderStyle = '3px solid #1890ff';
                } else if (isLastMovedPiece) {
                     borderStyle = '3px solid #52c41a'; // 绿色边框高亮
                }
                
                return (
                    <div 
                        key={piece.id}
                        onClick={() => isMovable && setSelectedStackIndex(index)}
                        style={{ ...baseStyle, border: borderStyle, fontWeight: 'bold' }}
                    >
                        {piece.id} {piece.direction === 1 ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
                    </div>
                );
            }
            
            return (
                <div 
                    key={piece.id}
                    style={{ ...baseStyle, opacity: 0.8, border: '1px dashed grey', fontWeight: 'normal' }}
                >
                    <Text style={{color: textColor, fontSize: '10px'}}>{piece.id}</Text>
                </div>
            );
        };
        
        const captives = topPiece.captives || [];
        const stackDepth = 1 + captives.length; 
        const containerHeight = stackDepth * (PIECE_HEIGHT * 0.5) + PIECE_HEIGHT * 0.5; 
        
        const containerStyle = {
            ...STYLES.stackContainerBase,
            marginTop: `${containerHeight - PIECE_HEIGHT}px`,
            cursor: isMovable ? 'pointer' : 'default',
            opacity: isCurrentPlayer && diceRoll !== 0 && !isMovable ? 0.6 : 1,
        };

        const stackRender = [];
        
        captives.forEach((captive, i) => {
            const offset = (captives.length - 1 - i) * PIECE_HEIGHT * 0.4;
            stackRender.push(renderStackPiece(captive, false, offset));
        });

        const topPieceOffset = captives.length * PIECE_HEIGHT * 0.4;
        stackRender.push(renderStackPiece(topPiece, true, topPieceOffset));


        return (
            <div 
                style={containerStyle}
            >
                {stackRender}
                <Tag 
                    color="blue" 
                    style={{ position: 'absolute', bottom: -5, right: -5, zIndex: 100 }}
                    icon={<PlusOutlined />}
                >
                    x{stackDepth}
                </Tag>
            </div>
        );
    };
    
    const renderGameInfo = () => {
        const p2Label = gameMode === 'AI_VS_HUMAN' ? 'AI (白)' : '玩家二 (白)';
        const p2Icon = gameMode === 'AI_VS_HUMAN' ? <RobotOutlined /> : <UserOutlined />;
        
        return (
            <Card style={{ marginBottom: 20 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Title level={4} style={{ margin: 0 }}>
                        {winner ? (
                            <Text type="success" strong><TrophyOutlined /> 游戏结束</Text>
                        ) : (
                            <Text>当前回合: </Text>
                        )}
                        <Tag 
                            color={currentPlayer === 'player1' ? 'black' : 'white'}
                            style={{ fontSize: 18, border: currentPlayer === 'player2' ? '1px solid #d9d9d9' : 'none', color: currentPlayer === 'player2' ? 'black' : 'white' }}
                            icon={currentPlayer === 'player1' ? <UserOutlined /> : p2Icon}
                        >
                            {currentPlayer === 'player1' ? '玩家一 (黑)' : p2Label}
                            {isAITurn && <Spin size="small" style={{ marginLeft: 8 }} />}
                        </Tag>
                    </Title>
                    
                    <Text strong>模式:</Text>
                    <Tag color="cyan">{gameMode === 'AI_VS_HUMAN' ? '人机对战' : '双人对战'}</Tag>

                    <Space>
                        <Text strong>已投骰子点数:</Text>
                        <Tag color="blue" style={{ fontSize: 16 }}>{diceRoll || 'N/A'}</Tag>
                    </Space>
                    
                    <Space>
                        <Text strong>玩家一被移出:</Text>
                        <Tag icon={<CloseCircleOutlined />} color="red">{eliminatedPieces.filter(id => id.startsWith('P1')).length}</Tag>
                        <Text strong>{p2Label}被移出:</Text>
                        <Tag icon={<CloseCircleOutlined />} color="red">{eliminatedPieces.filter(id => id.startsWith('P2')).length}</Tag>
                    </Space>
                </Space>
            </Card>
        );
    };

    const renderModeSelection = () => (
        <Space direction="vertical" size="large" style={{ marginTop: 50, marginBottom: 50 }}>
            <Title level={4}>请选择游戏模式</Title>
            <Button 
                type="primary" 
                size="large" 
                icon={<RobotOutlined />} 
                onClick={() => startGame('AI_VS_HUMAN')}
            >
                人机对战 (玩家一 vs AI)
            </Button>
            <Button 
                type="default" 
                size="large" 
                icon={<TeamOutlined />} 
                onClick={() => startGame('HUMAN_VS_HUMAN')}
            >
                双人对战 (玩家一 vs 玩家二)
            </Button>
        </Space>
    );

    const boardItems = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        const stack = board[i];
        const isHomeBase = i === 0 || i === BOARD_SIZE - 1;
        
        const isTargetDestination = selectedMove && selectedMove.endIndex === i && selectedMove.type !== 'REVERSE_ONLY';
        const isReverseOnlyTarget = selectedMove && selectedMove.startIndex === i && selectedMove.type === 'REVERSE_ONLY';
        
        // 【新增】：检查是否是上一次移动的终点
        const isLastMoveDestination = lastMoveInfo.index === i;
        
        let cellBackgroundColor = isHomeBase ? '#e6f7ff' : (i % 2 === 0 ? '#f0f0f0' : '#fafafa');
        let cellBorder = '1px solid #d9d9d9';

        if (isTargetDestination) {
            cellBackgroundColor = '#ffe7ba'; 
            cellBorder = '3px solid #fa8c16';
        } else if (isReverseOnlyTarget) {
            cellBackgroundColor = '#fff1b8'; 
            cellBorder = '3px dashed #ffc53d';
        } 
        // 【新增】：高亮上一次移动的终点
        else if (isLastMoveDestination) {
             cellBackgroundColor = '#e6ffed'; // 浅绿色
             cellBorder = '3px solid #52c41a'; // 绿色边框
        }


        const cellStyle = {
            width: '80px',
            height: '100%',
            minHeight: '100px',
            padding: '8px',
            backgroundColor: cellBackgroundColor,
            border: cellBorder,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end', 
            alignItems: 'center',
            position: 'relative',
            transition: 'background-color 0.3s ease, border 0.3s ease', // 平滑过渡
        };

        boardItems.push(
            <div key={i} style={cellStyle}>
                <Text type="secondary" style={{ position: 'absolute', top: 5, left: 5, fontSize: 12 }}>
                    {i + 1}
                </Text>
                {isHomeBase && <Text strong style={{ position: 'absolute', top: 5, right: 5 }}>{i === 0 ? 'P1大本营' : 'P2大本营'}</Text>}
                {renderPieceStack(stack, i)}
            </div>
        );
    }
    
    return (
        <div style={STYLES.container}>
            <Card 
                title={<Title level={3} style={{ margin: 0 }}>俘虏棋 (Captive Chess)</Title>}
                extra={gameStarted && <Button onClick={() => setGameStarted(false)}>切换模式</Button>}
                style={STYLES.card}
            >
                {!gameStarted ? (
                    renderModeSelection()
                ) : (
                    <>
                        {renderGameInfo()}
                        
                        <Space size="large" style={{ marginBottom: 20, alignItems: 'center' }}>
                            
                            <Button 
                                type="primary" 
                                size="large" 
                                onClick={rollDiceAndStartTurn} 
                                disabled={diceRoll !== 0 || !!winner || !turnCompleteRef.current || isAITurn}
                            >
                                投掷骰子
                            </Button>
                            
                            <div style={STYLES.diceContainer}>
                                <ReactDice
                                    numDice={1}
                                    ref={diceRef}
                                    rollDone={onDiceRoll}
                                    faceColor={isAITurn ? "#f0ad4e" : "#1890ff"} 
                                    dotColor="#fff"
                                    outline={true}
                                    outlineColor="#40a9ff"
                                    dieSize={50}
                                    disableIndividual={true} 
                                    rollTime={1} 
                                    customDices={['1', '2', '3', '4', '5']} 
                                />
                            </div>

                            <Button
                                type="primary"
                                danger
                                size="large"
                                onClick={handleMove}
                                disabled={diceRoll === 0 || selectedStackIndex === null || !selectedMove || isAITurn}
                            >
                                🎯 移动棋子 ({selectedMove ? selectedMove.type : 'N/A'})
                            </Button>
                        </Space>
                        
                        <div style={STYLES.boardGrid}>
                            {boardItems}
                        </div>
                    </>
                )}
            </Card>
            <Card title="游戏规则摘要" style={{ width: '90%', maxWidth: 1000 }}>
                <Text style={{ display: 'block' }}>- **人机对战:** 玩家一 (黑棋) 是人类，玩家二 (白棋) 是 AI。</Text>
                <Text style={{ display: 'block' }}>- **双人对战:** 玩家一 (黑棋) 和玩家二 (白棋) 都是人类玩家。</Text>
                <Text style={{ display: 'block', marginTop: 8 }}>- **核心规则** (捕获锁向、大本营释放、不可入敌本营) 在两种模式下均适用。</Text>
            </Card>
        </div>
    );
};

export default CaptiveChessGame;