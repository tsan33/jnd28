import React from 'react';
import { Tooltip } from 'antd';
import { formatDateTime, formatUTCTime } from '@/utils/format';

/**
 * 时间显示组件（本地化+UTC tooltip）
 */
const TimeTooltip = ({ time, format }) => {
  return (
    <Tooltip title={formatUTCTime(time)}>
      <span style={{ cursor: 'help', borderBottom: '1px dashed #d9d9d9' }}>
        {formatDateTime(time, format)}
      </span>
    </Tooltip>
  );
};

export default TimeTooltip;

