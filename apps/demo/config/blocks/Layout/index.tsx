
import { merge } from 'lodash';
import { forwardRef, type ReactNode } from 'react';
import styles from './layout.module.css';
import { WithLayout } from '../../decorators/withLayout';

export type LayoutProps = WithLayout<{
  children: ReactNode;
  className?: string;
}>;

export const LayoutRender = forwardRef<HTMLDivElement, LayoutProps>(({ children, className, layout }, ref) => {
  const { mobile, ...desktopLayout } = layout ?? {};

  const correctMobile = merge({}, desktopLayout, mobile);

  const {
    paddingTop = '0px',
    paddingBottom = '0px',
    paddingLeft = '0px',
    paddingRight = '0px',
    marginTop = '0px',
    marginBottom = '0px',
    marginLeft = '0px',
    marginRight = '0px',
    grow = false,
    alignSelf = 'auto',
    position = 'static',
    zIndex = 1,
    spanCol = 1,
    spanRow = 1,
    width = 'auto',
    order = 0,
  } = desktopLayout ?? {};

  // Generate CSS custom properties for dynamic values
  const cssVariables = {
    '--width': width,
    '--mobile-width': correctMobile.width,

    '--padding-top': paddingTop,
    '--padding-bottom': paddingBottom,
    '--padding-left': paddingLeft,
    '--padding-right': paddingRight,

    '--margin-top': marginTop,
    '--margin-bottom': marginBottom,
    '--margin-left': marginLeft,
    '--margin-right': marginRight,

    '--mobile-padding-top': correctMobile.paddingTop,
    '--mobile-padding-bottom': correctMobile.paddingBottom,
    '--mobile-padding-left': correctMobile.paddingLeft,
    '--mobile-padding-right': correctMobile.paddingRight,

    '--mobile-margin-top': correctMobile.marginTop,
    '--mobile-margin-bottom': correctMobile.marginBottom,
    '--mobile-margin-left': correctMobile.marginLeft,
    '--mobile-margin-right': correctMobile.marginRight,

    '--grow': grow ? '1 1 0' : '0 0 auto',
    '--mobile-grow': correctMobile.grow ? '1 1 0' : '0 0 auto',

    '--align-self': alignSelf,
    '--mobile-align-self': correctMobile.alignSelf,

    '--position': position,
    '--mobile-position': correctMobile.position,

    '--z-index': zIndex,
    '--mobile-z-index': correctMobile.zIndex,

    '--span-col': spanCol ? `span ${Math.max(Math.min(spanCol, 12), 1)}` : 'auto',
    '--mobile-span-col': correctMobile.spanCol ? `span ${Math.max(Math.min(correctMobile.spanCol, 12), 1)}` : 'auto',

    '--span-row': spanRow ? `span ${Math.max(Math.min(spanRow, 12), 1)}` : 'auto',
    '--mobile-span-row': correctMobile.spanRow ? `span ${Math.max(Math.min(correctMobile.spanRow, 12), 1)}` : 'auto',

    '--order': order,
    '--mobile-order': correctMobile.order,
  } as React.CSSProperties;

  // console.log('LayoutRender', order, mobile.order);

  return (
    <div className={`${className} ${styles.layoutContainer}`} style={cssVariables} ref={ref}>
      {children}
    </div>
  );
});

LayoutRender.displayName = 'LayoutRender';
