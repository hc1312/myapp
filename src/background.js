// src/ParticleBackground.js
import React, { useRef, useEffect } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // 设置 Canvas 尺寸
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // 粒子配置
    const particlesArray = [];
    const numberOfParticles = 100; // 粒子数量，可根据性能调整
    const connectionDistance = 150; // 连线距离阈值

    // 鼠标交互位置
    const mouse = { x: null, y: null };

    window.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // 粒子类
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = 'rgba(50, 50, 50, 0.5)'; // 浅蓝色粒子
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检测（碰到边缘反弹）
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        // 鼠标互动：如果鼠标靠近，稍微避让或吸引（这里做个简单的连接效果）
        // 简单重绘
        this.draw();
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 初始化粒子
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    // 连线逻辑
    function connect() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let distance =
            (particlesArray[a].x - particlesArray[b].x) *
              (particlesArray[a].x - particlesArray[b].x) +
            (particlesArray[a].y - particlesArray[b].y) *
              (particlesArray[a].y - particlesArray[b].y);

          if (distance < (connectionDistance * connectionDistance)) {
            // 计算连线透明度：距离越远越淡
            let opacityValue = 1 - distance / 20000;
            ctx.strokeStyle = 'rgba(100, 181, 246,' + opacityValue + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // 动画循环
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', // 固定定位，覆盖全屏
        top: 0,
        left: 0,
        zIndex: -1, // 放在最底层
        background: 'linear-gradient(to bottom, #f0f2f5, #e1e4e8)', // 深色渐变背景底色
      }}
    />
  );
};

export default ParticleBackground;