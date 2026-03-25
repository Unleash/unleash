import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material';

const CELL_SIZE = 16;
const GRID_W = 22;
const GRID_H = 16;
const TICK_MS = 120;

type Pos = { x: number; y: number };
type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const opposite: Record<Dir, Dir> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
};

const randomFood = (snake: Pos[]): Pos => {
    let pos: Pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_W),
            y: Math.floor(Math.random() * GRID_H),
        };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
};

const StyledCanvas = styled('canvas')({
    display: 'block',
    borderRadius: 4,
    border: '1px solid #e0e0e0',
});

const StyledWrapper = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
});

const StyledScore = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

export const SnakeGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dirRef = useRef<Dir>('RIGHT');
    const nextDirRef = useRef<Dir>('RIGHT');
    const snakeRef = useRef<Pos[]>([
        { x: 4, y: 8 },
        { x: 3, y: 8 },
        { x: 2, y: 8 },
    ]);
    const foodRef = useRef<Pos>(randomFood(snakeRef.current));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const gameOverRef = useRef(false);

    const reset = useCallback(() => {
        snakeRef.current = [
            { x: 4, y: 8 },
            { x: 3, y: 8 },
            { x: 2, y: 8 },
        ];
        foodRef.current = randomFood(snakeRef.current);
        dirRef.current = 'RIGHT';
        nextDirRef.current = 'RIGHT';
        gameOverRef.current = false;
        setGameOver(false);
        setScore(0);
    }, []);

    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, GRID_W * CELL_SIZE, GRID_H * CELL_SIZE);

        // food
        ctx.fillStyle = '#98E3AF';
        ctx.fillRect(
            foodRef.current.x * CELL_SIZE + 1,
            foodRef.current.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2,
        );

        // snake
        snakeRef.current.forEach((seg, i) => {
            ctx.fillStyle = i === 0 ? '#6c65e5' : '#8b85ec';
            ctx.fillRect(
                seg.x * CELL_SIZE + 1,
                seg.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2,
            );
        });

        if (gameOverRef.current) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, GRID_W * CELL_SIZE, GRID_H * CELL_SIZE);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
                'Game Over! Click to restart',
                (GRID_W * CELL_SIZE) / 2,
                (GRID_H * CELL_SIZE) / 2,
            );
        }
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const keyMap: Record<string, Dir> = {
                ArrowUp: 'UP',
                ArrowDown: 'DOWN',
                ArrowLeft: 'LEFT',
                ArrowRight: 'RIGHT',
                w: 'UP',
                s: 'DOWN',
                a: 'LEFT',
                d: 'RIGHT',
            };
            const newDir = keyMap[e.key];
            if (newDir && newDir !== opposite[dirRef.current]) {
                e.preventDefault();
                nextDirRef.current = newDir;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => {
        const tick = () => {
            if (gameOverRef.current) return;

            dirRef.current = nextDirRef.current;
            const head = { ...snakeRef.current[0] };
            switch (dirRef.current) {
                case 'UP':
                    head.y--;
                    break;
                case 'DOWN':
                    head.y++;
                    break;
                case 'LEFT':
                    head.x--;
                    break;
                case 'RIGHT':
                    head.x++;
                    break;
            }

            if (
                head.x < 0 ||
                head.x >= GRID_W ||
                head.y < 0 ||
                head.y >= GRID_H ||
                snakeRef.current.some((s) => s.x === head.x && s.y === head.y)
            ) {
                gameOverRef.current = true;
                setGameOver(true);
                draw();
                return;
            }

            snakeRef.current.unshift(head);

            if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
                foodRef.current = randomFood(snakeRef.current);
                setScore((s) => s + 1);
            } else {
                snakeRef.current.pop();
            }

            draw();
        };

        const id = setInterval(tick, TICK_MS);
        draw();
        return () => clearInterval(id);
    }, [draw]);

    const handleClick = () => {
        if (gameOver) {
            reset();
        }
    };

    return (
        <StyledWrapper>
            <StyledScore>Score: {score}</StyledScore>
            <StyledCanvas
                ref={canvasRef}
                width={GRID_W * CELL_SIZE}
                height={GRID_H * CELL_SIZE}
                onClick={handleClick}
                tabIndex={0}
            />
        </StyledWrapper>
    );
};
