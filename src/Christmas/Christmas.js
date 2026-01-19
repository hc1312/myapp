import React from 'react';
import { Carousel, Typography } from 'antd';
import Snow from './snow';
const { Title, Text } = Typography;

const images = [
    '/1.jpg',
    '/2.jpg',
    '/3.jpg',
];

export default function ChristmasPage() {
    return (
        <div style={{ position: 'relative' }}>
            <Snow />

            <div style={styles.page}>
                {/* 顶部文案 */}
                <div style={styles.header}>
                    <Title level={2} style={{ marginBottom: 8 }}>
                        🎄 Merry Christmas
                    </Title>
                    <Text type="secondary">
                        平安喜乐 · 得偿所愿
                    </Text>
                </div>

                {/* 图片轮播 */}
                <div style={styles.carouselWrapper}>
                    <Carousel
                        autoplay
                        autoplaySpeed={4500}
                        dots
                        effect="fade"
                    >
                        {images.map((src, index) => (
                            <div key={index} style={styles.slide}>
                                <img
                                    src={src}
                                    alt={`christmas-${index}`}
                                    style={styles.image}
                                />
                            </div>
                        ))}
                    </Carousel>
                </div>

                {/* 底部小字 */}
                <div style={styles.footer}>
                    <Text type="secondary">
                        ✨ 愿这个冬天，温柔又浪漫
                    </Text>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fdf1f1 0%, #fffaf7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px',
    },
    header: {
        textAlign: 'center',
        marginBottom: 24,
    },
    carouselWrapper: {
        width: '100%',
        maxWidth: 420,          // 🔑 控制最大宽度，防止“跑飞”
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
    },
    slide: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#000',
    },
    image: {
        width: '100%',
        height: 'auto',
        objectFit: 'contain',   // 🔑 不裁剪、不拉伸
    },
    footer: {
        marginTop: 28,
    },
};
