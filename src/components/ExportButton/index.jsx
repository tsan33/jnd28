import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { DownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { downloadCSV } from '@/utils/format';

/**
 * 导出按钮组件
 */
const ExportButton = ({ onExport, filters, estimatedRows }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    // 如果预估行数过多，弹窗确认
    if (estimatedRows && estimatedRows > 200000) {
      Modal.warning({
        title: '数据量过大',
        icon: <ExclamationCircleOutlined />,
        content: `预估导出 ${estimatedRows.toLocaleString()} 行数据，超过20万行限制。请缩小筛选条件或使用分片导出。`,
      });
      return;
    }

    Modal.confirm({
      title: '确认导出',
      icon: <ExclamationCircleOutlined />,
      content: estimatedRows
        ? `将按当前筛选条件导出约 ${estimatedRows.toLocaleString()} 行数据，是否继续？`
        : '将按当前筛选条件导出数据，是否继续？',
      onOk: async () => {
        setLoading(true);
        try {
          await onExport(filters);
          message.success('导出成功');
        } catch (error) {
          message.error(error.message || '导出失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
      loading={loading}
    >
      导出CSV
    </Button>
  );
};

export default ExportButton;

