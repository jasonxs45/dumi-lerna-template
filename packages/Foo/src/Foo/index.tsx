import React from 'react';

interface FooProps {
  /**
   * 标题
   */
  title: string;
}

export default ({ title }: FooProps) => <h1>{title}</h1>;
