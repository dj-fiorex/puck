import type { PuckComponent } from '@puckeditor/core';
import styles from './styles.module.css';

export type SpaceProps = {
  direction?: '' | 'vertical' | 'horizontal';
  size: string;
  mobileSize: string;
};

export const SpaceRender: PuckComponent<SpaceProps> = ({ direction, size = '16px', mobileSize = '24px', puck }) => {
  const cssProperties = {
    '--size': size,
    '--mobile-size': mobileSize,
  } as React.CSSProperties;
  return (
    <div
      ref={puck.dragRef}
      className={`${styles.space} ${
        direction === 'vertical' ? styles.spaceVertical : direction === 'horizontal' ? styles.spaceHorizontal : '' }`}
      style={cssProperties}
    />
  );
};
