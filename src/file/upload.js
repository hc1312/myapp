import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;
const props = {
  name: 'file',
  multiple: true,
  action: 'http://192.168.10.186:5555/upload',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} 已经上传成功！`);
    } else if (status === 'error') {
      message.error(`${info.file.name} 上传失败！`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};
const Uploadfile = () => (
  <Dragger {...props}>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">点击或者拖拽文件到框框内来上传 </p>
    <p className="ant-upload-hint">
        快来上传文件吧，啥文件都行
    </p>
  </Dragger>
);
export default Uploadfile;