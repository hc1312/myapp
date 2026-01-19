import React, { useState, useEffect } from 'react';
import { Card, Upload, Modal, Button, message, Input, Popconfirm, Empty, Switch, Row, Col, Tag } from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined, 
    CalendarOutlined, 
    CameraOutlined, 
    LockOutlined, 
    GlobalOutlined,
    UserOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPhotos, uploadPhoto, deletePhoto } from './utils/request';

const { Meta } = Card;

const PhotoAlbum = () => {
    const [photos, setPhotos] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [desc, setDesc] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const fetchPhotos = async () => {
        try {
            const data = await getPhotos();
            setPhotos(data || []);
        } catch (error) {
            console.error('获取照片失败:', error);
        }
    };

    useEffect(() => { fetchPhotos(); }, []);

    // 🚀 上传逻辑：只传文件、描述和权限，EXIF交给后端
    const handleUpload = async () => {
        if (fileList.length === 0) return message.warning('还没选照片呢~');
        setUploading(true);
        
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        formData.append('description', desc);
        formData.append('is_public', isPublic ? 1 : 0);

        try {
            await uploadPhoto(formData);
            message.success('上传成功，后端正在解析EXIF信息...✨');
            setIsModalVisible(false);
            setFileList([]);
            setDesc('');
            fetchPhotos();
        } catch (error) {
            message.error('上传失败');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePhoto(id);
            message.success('已从时光机中移除');
            fetchPhotos();
        } catch (error) {
            message.error('删除失败');
        }
    };

    return (
        <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#ff4d6d' }}>📸 时光相册会议</h2>
                <Button type="primary" shape="round" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    添加新回忆
                </Button>
            </div>

            <Row gutter={[16, 24]}>
                {photos.map((photo) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
                        <Card
                            hoverable
                            cover={
                                <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#f0f0f0' }}>
                                    <img 
                                        alt="" 
                                        src={photo.url} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        onClick={() => { setPreviewImage(photo.url); setPreviewOpen(true); }} 
                                    />
                                    {/* 👤 顶部标签：显示是谁上传的 */}
                                    <div style={{ position: 'absolute', top: 8, left: 8 }}>
                                        <Tag color="rgba(0,0,0,0.4)" style={{ border: 'none', borderRadius: '4px' }}>
                                            <UserOutlined /> {photo.username || `UID:${photo.user_id}`}
                                        </Tag>
                                    </div>
                                </div>
                            }
                        >
                            <Meta
                                title={<div style={{ fontSize: '14px', marginBottom: '8px' }}>{photo.description || '这一刻值得纪念'}</div>}
                                description={
                                    <div style={{ fontSize: '11px' }}>
                                        {/* 📅 展示解析出来的 shooting_time */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                                            <span>
                                                <CalendarOutlined style={{ marginRight: 4 }} /> 
                                                {photo.shooting_time ? dayjs(photo.shooting_time).format('YYYY-MM-DD HH:mm') : '时间信息缺失'}
                                            </span>
                                            {photo.is_public ? <GlobalOutlined title="公开" /> : <LockOutlined title="私密" />}
                                        </div>
                                        
                                        {/* 📷 展示解析出来的 camera_model */}
                                        <div style={{ marginTop: '6px', padding: '6px', background: '#f9f9f9', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#888' }}>
                                                <CameraOutlined style={{ marginRight: 4 }} />
                                                {photo.camera_model || '无法识别设备'}
                                            </span>
                                            
                                            {(userInfo.role === 'admin' || photo.user_id === userInfo.id) && (
                                                <Popconfirm title="确定要删除这段回忆吗？" onConfirm={() => handleDelete(photo.id)}>
                                                    <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} />
                                                </Popconfirm>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 上传弹窗：精简版 */}
            <Modal
                title={<span><InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />添加新回忆</span>}
                open={isModalVisible}
                onOk={handleUpload}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={uploading}
                okText="开始上传"
            >
                <p style={{ color: '#888', fontSize: '12px' }}>* 请尽量上传原图，后端会自动解析照片的拍摄时间和设备信息哦！</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Upload 
                            listType="picture-card" 
                            fileList={fileList} 
                            onChange={({ fileList }) => setFileList(fileList)} 
                            beforeUpload={() => false} 
                            maxCount={1}
                        >
                            {fileList.length < 1 && <div><PlusOutlined /><div>选照片</div></div>}
                        </Upload>
                    </div>

                    <Input.TextArea 
                        placeholder="写下此刻的故事..." 
                        rows={3} 
                        value={desc} 
                        onChange={e => setDesc(e.target.value)} 
                        maxLength={100}
                        showCount
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>是否公开照片</span>
                        <Switch checked={isPublic} onChange={setIsPublic} checkedChildren="公开" unCheckedChildren="私密" />
                    </div>
                </div>
            </Modal>

            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} centered width={isMobile ? '100%' : '70%'}>
                <img alt="预览" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
};

export default PhotoAlbum;