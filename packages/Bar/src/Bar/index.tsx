import React, { CSSProperties, ReactNode } from 'react';
import AwesomeButton from 'react-awesome-button/src/components/AwesomeButton';
import 'react-awesome-button/dist/styles.css';

interface BarProps {
  /**
   * 按钮样式
   */
  type: string;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default (props: BarProps) => {
  const { type, style, className, children } = props;
  return (
    <AwesomeButton style={style} className={className} type={type}>
      {children}
    </AwesomeButton>
  );
};
