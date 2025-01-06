import React, { useEffect, useRef, useState } from 'react';

const clampSpeed = (value) => {
    const min = 0;
    const max = 100;
    const throttle = 0.001;
    if (value <= min) return min;
    return Math.min(max, value) * throttle;
};

const getDistanceFromTopRight = (x, y, width) => {
    const dx = width - x;
    return Math.sqrt(dx * dx + y * y);
};

class Pixel {
    width: any;
    height: any;
    ctx: any;
    x: any;
    y: any;
    color: any;
    speed: number;
    size: number;
    sizeStep: number;
    minSize: number;
    maxSizeInteger: number;
    maxSize: any;
    delay: any;
    counter: number;
    counterStep: number;
    isIdle: boolean;
    isReverse: boolean;
    isShimmer: boolean;
    constructor(canvas, context, x, y, color, speed, delay, maxSize = 2) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = context;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = this.getRandomValue(0.1, 0.9) * speed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInteger = maxSize;
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
        this.delay = delay;
        this.counter = 0;
        this.counterStep =
            Math.random() * 4 + (this.width + this.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
    }

    getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }

    draw() {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
        const r = (this.size * 0.5) | 0;
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.x + centerOffset,
            this.y + centerOffset,
            this.size,
            this.size,
            r,
        );
        this.ctx.fill();
        this.ctx.closePath();
    }

    appear() {
        this.isIdle = false;
        if (this.counter <= this.delay) {
            this.counter += this.counterStep;
            return;
        }
        if (this.size >= this.maxSize) {
            this.isShimmer = true;
        }
        if (this.isShimmer) {
            this.shimmer();
        } else {
            this.size += this.sizeStep;
        }
        this.draw();
    }

    disappear() {
        this.isShimmer = false;
        this.counter = 0;
        if (this.size <= 0) {
            this.isIdle = true;
            return;
        }
        this.size -= 0.1;
        this.draw();
    }

    shimmer() {
        if (this.size >= this.maxSize) {
            this.isReverse = true;
        } else if (this.size <= this.minSize) {
            this.isReverse = false;
        }
        if (this.isReverse) {
            this.size -= this.speed;
        } else {
            this.size += this.speed;
        }
    }
}

const PixelCanvas = ({
    colors = ['#f8fafc', '#f1f5f9', '#cbd5e1'],
    speed = 35,
    maxSize = 3,
    noFocus = false,
    className = '',
}) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const pixelsRef = useRef([]);
    const timeIntervalRef = useRef(1000 / 60);
    const timePreviousRef = useRef(performance.now());
    const containerRef = useRef(null);

    const [ctx, setCtx] = useState(null);
    const createPixels = (canvas, context) => {
        const pixels = [];
        const gap = maxSize + 2;
        const finalSpeed = clampSpeed(speed);

        for (let x = 0; x < canvas.width; x += gap) {
            for (let y = 0; y < canvas.height; y += gap) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const dist = getDistanceFromTopRight(x, y, canvas.width);
                const delay = dist;
                const lastX = canvas.width - gap;
                console.log(x, lastX);
                const isTopMostRight = x > lastX && y === 0;

                if (dist < canvas.width * 0.4 && !isTopMostRight) {
                    pixels.push(
                        new Pixel(
                            canvas,
                            context,
                            x,
                            y,
                            color,
                            finalSpeed,
                            delay,
                            maxSize,
                        ),
                    );
                }
            }
        }
        return pixels;
    };

    const animate = (name) => {
        animationRef.current = requestAnimationFrame(() => animate(name));

        const timeNow = performance.now();
        const timePassed = timeNow - timePreviousRef.current;

        if (timePassed < timeIntervalRef.current) return;

        timePreviousRef.current =
            timeNow - (timePassed % timeIntervalRef.current);

        if (ctx && canvasRef.current) {
            ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height,
            );

            for (let i = 0; i < pixelsRef.current.length; i++) {
                if (name === 'appear') {
                    pixelsRef.current[i].appear();
                } else {
                    pixelsRef.current[i].disappear();
                }
            }

            if (pixelsRef.current.every((pixel) => pixel.isIdle)) {
                cancelAnimationFrame(animationRef.current);
            }
        }
    };

    const handleAnimation = (name) => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        animate(name);
    };

    const initCanvas = () => {
        if (canvasRef.current && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const width = Math.floor(rect.width);
            const height = Math.floor(rect.height);

            canvasRef.current.width = width;
            canvasRef.current.height = height;
            canvasRef.current.style.width = `${width}px`;
            canvasRef.current.style.height = `${height}px`;

            const context = canvasRef.current.getContext('2d');
            setCtx(context);
            pixelsRef.current = createPixels(canvasRef.current, context);
        }
    };

    useEffect(() => {
        if (canvasRef.current) {
            initCanvas();
        }
    });

    return (
        <div
            ref={containerRef}
            className={className}
            onMouseEnter={() => handleAnimation('appear')}
            onMouseLeave={() => handleAnimation('disappear')}
            onFocus={(e) => {
                if (!noFocus && !e.currentTarget.contains(e.relatedTarget)) {
                    handleAnimation('appear');
                }
            }}
            onBlur={(e) => {
                if (!noFocus && !e.currentTarget.contains(e.relatedTarget)) {
                    handleAnimation('disappear');
                }
            }}
        >
            <canvas ref={canvasRef} />
        </div>
    );
};

export default PixelCanvas;
