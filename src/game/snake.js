import React, { useState, useEffect, useRef } from 'react';
import { Typography, Card, Modal } from 'antd'

const { Title, Paragraph } = Typography;
const SnakeGame = () => {
    const gridSize = 30;
    const initialSnake = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 7 },
    ];
    const initialDirection = 'RIGHT';

    const generateRandomPosition = () => {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        return { x, y };
    };
    const [snake, setSnake] = useState(initialSnake);
    const [food, setFood] = useState(generateRandomPosition());
    const [direction, setDirection] = useState(initialDirection);
    const [isGameOver, setIsGameOver] = useState(false);

    // 使用 useRef 来保存游戏的时间间隔
    const gameInterval = useRef(150);

    // 使用 useEffect 来监听 snake 状态的变化，每次变化后，再调用 moveSnake 函数
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isGameOver) {
                moveSnake();
            }
        }, gameInterval.current);

        return () => {
            clearTimeout(timer);
        };
    }, [snake]);

    useEffect(() => {
        handleCollision();
        handleEatFood();
    }, [snake, food]);

    // 使用 useEffect 来监听键盘事件，并根据按键的值来调用 setDirection 函数
    useEffect(() => {
        // 定义一个处理键盘事件的函数
        const handleKeyPress = (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    setDirection('UP');
                    break;
                case 'ArrowDown':
                    setDirection('DOWN');
                    break;
                case 'ArrowLeft':
                    setDirection('LEFT');
                    break;
                case 'ArrowRight':
                    setDirection('RIGHT');
                    break;
                default:
                    break;
            }
        };
        // 添加键盘事件的监听器
        window.addEventListener('keydown', handleKeyPress);

        // 返回一个清理函数，移除键盘事件的监听器
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const moveSnake = () => {
        const newSnake = [...snake];
        const head = { ...newSnake[0] };

        switch (direction) {
            case 'UP':
                head.y = (head.y - 1 + gridSize) % gridSize;
                break;
            case 'DOWN':
                head.y = (head.y + 1) % gridSize;
                break;
            case 'LEFT':
                head.x = (head.x - 1 + gridSize) % gridSize;
                break;
            case 'RIGHT':
                head.x = (head.x + 1) % gridSize;
                break;
            default:
                break;
        }

        newSnake.unshift(head);

        if (!isGameOver) {
            newSnake.pop();
        }

        setSnake(newSnake);
    };

    const handleCollision = () => {
        const head = snake[0];

        // Check collision with walls
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            setIsGameOver(true);
        }

        // Check collision with itself
        const body = snake.slice(1);
        if (body.some(segment => segment.x === head.x && segment.y === head.y)) {
            setIsGameOver(true);
        }
    };

    const handleEatFood = () => {
        const head = snake[0];
        if (head.x === food.x && head.y === food.y) {
            setFood(generateRandomPosition());
            // Grow the snake by adding a new head in the same direction
            const newSnake = [...snake];
            const tail = { ...newSnake[newSnake.length - 1] };
            newSnake.push(tail);
            setSnake(newSnake);
            // 每吃一个食物，就减少游戏的时间间隔，增加难度
            gameInterval.current = gameInterval.current * 0.95;
        }
    };

    // 定义一个重新开始游戏的函数
    const restartGame = () => {
        // 重置蛇的位置，方向，食物的位置，游戏状态和时间间隔
        setSnake(initialSnake);
        setDirection(initialDirection);
        setFood(generateRandomPosition());
        setIsGameOver(false);
        gameInterval.current = 100;
    };

    return (
        <div>
            <Card title="贪吃蛇" bordered={false}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 20px)`,
                    }}
                >
                    {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                        const x = index % gridSize;
                        const y = Math.floor(index / gridSize);
                        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                        const isFood = food.x === x && food.y === y;

                        return (
                            <div
                                key={index}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '1px solid #ddd',
                                    backgroundColor: isSnake ? '#333' : isFood ? 'red' : 'white',
                                }}
                            ></div>
                        );
                    })}
                </div>
                <Paragraph>使用方向键控制.</Paragraph>
                <Paragraph>分数：{snake.length - initialSnake.length}</Paragraph>
            </Card>
            {/* 添加一个 Modal 组件，用来显示游戏失败时的提示，并提供一个重新开始的按钮 */}
            <Modal
                title="游戏结束"
                visible={isGameOver}
                onCancel={restartGame}
                onOk={restartGame}
                okText="重新开始"
                cancelText="取消"
            >
                <p>你的分数是：{snake.length - initialSnake.length}</p>
                <p>你想要重新开始吗？</p>
            </Modal>
        </div>
    );
};

export default SnakeGame;
