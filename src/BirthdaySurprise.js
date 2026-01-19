import React, { useRef, useState, useEffect } from 'react';
import './BirthdaySurprise.css';

import photo1 from './1.jpg';
import photo2 from './2.jpg';
import photo3 from './3.jpg';
import confetti from 'canvas-confetti'; // 1. 引入纸屑库
const photos = [photo1, photo2, photo3];

const BirthdaySurprise = () => {
  const audioRef = useRef(null);
  const [lit, setLit] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const handleCandleClick = () => {
    if (!lit) {
      setLit(true);
      // 2. 触发炸开纸屑的小函数
      fireConfetti();
      if (!musicStarted && audioRef.current) {
        audioRef.current.play().catch(() => { });
        setMusicStarted(true);
      }
    }
  };
  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999, // 确保在最顶层
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff4d6d', '#ffb703'] });
    fire(0.2, { spread: 60, colors: ['#ff758f', '#ffffff'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#ff4d6d', '#ff85a1'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#ffb703'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#ff4d6d'] });
  };
  // 🎞️ 轻微轮播逻辑
  useEffect(() => {
    if (!lit) return;

    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 3500); // 3.5 秒一张

    return () => clearInterval(timer);
  }, [lit]);

  return (
    <div className="birthday-container" onClick={handleCandleClick}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="https://cdn.pixabay.com/audio/2023/03/13/audio_8f7f1b9cde.mp3"
      />


      <div className="card">
        {/* 📸 合照轮播 */}
        {lit && (
          <div className="photo-wrapper">
            <img
              key={photoIndex}              /* 关键：触发淡入动画 */
              src={photos[photoIndex]}
              alt="我们的合照"
              className="photo"
            />
          </div>
        )}
        <div className="floating heart">💖</div>
        <div className="floating heart delay1">💗</div>
        <div className="floating star">✨</div>
        <div className="floating star delay2">🌟</div>

        <div className="cake">
          🎂 <span className={`candle ${lit ? 'lit' : ''}`}>🕯️</span>
        </div>

        <h1>生日快乐呀</h1>
        <h2>❤️ 我最重要的人 ❤️</h2>

        <p>
          今天是属于你的日子，<br />
          所有温柔都为你停留。
        </p>

        {!lit && <div className="hint">轻轻点一下蜡烛 🕯️</div>}

        {lit && (
          <div className="signature">
            —— 这些都是我们走过的瞬间 💕
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdaySurprise;