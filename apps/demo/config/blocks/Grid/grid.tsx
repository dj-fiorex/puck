/* eslint-disable react-hooks/rules-of-hooks */
import type { PuckComponent, Slot } from '@puckeditor/core';
import type { CSSProperties } from 'react';
import { Section } from '../../components/Section';
import styles from './styles.module.css';

type BaseGridProps = { numColumns: number; gap: number };

export type GridProps = BaseGridProps & {
  items: Slot;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  mobile: BaseGridProps;
  tablet: BaseGridProps;
};

export const GridRender: PuckComponent<GridProps> = (props) => {
  const { hideOnDesktop = false, hideOnMobile = false, hideOnTablet = false, items: Items, mobile, tablet, ...desktop } = props;

  const { gap, numColumns } = desktop;
  const { gap: gapMobile = gap, numColumns: numColumnsMobile = 1 } = mobile ?? {};
  const { gap: gapTablet = gap, numColumns: numColumnsTablet = numColumns } = tablet ?? {};

  const cssProps = {
    '--gap': gap,
    '--mobile-gap': gapMobile,
    '--tablet-gap': gapTablet,
    '--num-columns': numColumns,
    '--mobile-num-columns': numColumnsMobile,
    '--tablet-num-columns': numColumnsTablet,
  } as CSSProperties;

  return (
    <Section className={`${hideOnMobile ? 'hidden-mobile' : ''} ${hideOnDesktop ? 'hidden-desktop' : ''} ${hideOnTablet ? 'hidden-tablet' : ''}`} style={cssProps}>
      <Items className={styles.grid} style={cssProps} />
    </Section>
  );
};
