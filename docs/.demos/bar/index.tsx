import Bar from 'bar';
import React from 'react';

export default () => (
  <div style={{ padding: '10px' }}>
    <Bar style={{ margin: '10px' }} type="primary">
      按钮1
    </Bar>
    <Bar style={{ margin: '10px' }} type="secondary">
      按钮2
    </Bar>
    <Bar style={{ margin: '10px' }} type="primary">
      按钮3
    </Bar>
  </div>
);
