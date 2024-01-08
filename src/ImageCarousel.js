import React from 'react';
// 从 antd/lib 下导入 Carousel 和 Image
import Carousel from 'antd/lib/carousel';
import Image from 'antd/lib/image';

// 图片的地址，你可以根据需要替换
const images = [
  'images/mmexport1691134003034.jpg',
  'images/mmexport1691134006606.jpg',
  'images/mmexport1691134008727.jpg',
  'images/mmexport1691134010886.jpg',
  'images/mmexport1691134013057.jpg',
  'images/mmexport1691134015203.jpg'
];
// 设置Carousel组件的父元素的style
const parentStyle = {
    display: 'flex', // 使用flex布局
  };
// 设置Carousel组件的style
const carouselStyle = {
    height: 'auto', // 自动高度
    width: 'auto', // 自动宽度
    borderRadius: '20px',
    overflow: 'hidden',
    alignSelf: 'center', // 在垂直方向上居中
    margin: '0 auto', // 在水平方向上居中
  };
  
  // 设置Image组件的style
  const imageStyle = {
    objectFit: 'contain' // 完整显示图片
  };
// 图片轮播的组件
const ImageCarousel = () => {
  return (
    // 设置容器的宽高和背景色

      <div className="carousel-demo" style={parentStyle}>
        <Carousel style={carouselStyle}  autoplay>
        {images.map((image, index) => (
          <div key={index}>
            <Image src={image} alt={`image${index + 1}`} style={imageStyle} />

          </div>
        ))}
        </Carousel>
      </div>
  );
};

export default ImageCarousel;
