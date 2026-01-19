import type { PuckComponent, Slot } from '@puckeditor/core';
import { Section } from '../../components/Section';
import styles from './flex.module.css';

type BaseFlexProps = {
  cursor: 'default' | 'pointer' | 'move' | 'text' | 'wait' | 'zoom-in' | 'zoom-out';
  direction?: 'row' | 'column';
  gap?: number;
  height?: string;
  width?: string;
  wrap: 'wrap' | 'nowrap';
  backgroundImageSrc?: string; // backgroundImage
  aspectRatio?: string; // aspectRatio
  justifyContent: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'start' | 'center' | 'end';
  link?: string;
  margin?: string;
  border?: string;
  borderRadius?: string; // borderRadius
  backgroundColor?: string;
  backgroundOverlay?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  className?: string; // for custom styles
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
};

export type FlexProps = BaseFlexProps & {
  useEvent: boolean;
  events?: { type: string; targetId: string; data: unknown }[];
  items: Slot;
  mobile?: BaseFlexProps;
};

export const FlexRender: PuckComponent<FlexProps> = ({
  cursor = 'default',
  useEvent = false,
  events = [],
  justifyContent,
  alignItems,
  direction,
  gap,
  wrap,
  link,
  margin = 'auto',
  border = 'none',
  borderRadius = '0px',
  backgroundColor,
  backgroundImageSrc,
  aspectRatio,
  backgroundOverlay,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  height = '100%',
  width = '100%',
  items: Items,
  className = '',
  mobile,
  hideOnDesktop = false,
  hideOnMobile = false,
  hideOnTablet = false,
}) => {
  // Generate CSS custom properties for dynamic values
  const cssVariables = {
    '--flex-direction': direction,
    '--mobile-flex-direction': mobile?.direction ?? direction,

    '--gap': gap ? `${gap}px` : 0,
    '--mobile-gap': mobile?.gap ? `${mobile.gap}px` : gap ? `${gap}px` : 0,

    '--cursor': cursor,
    '--mobile-cursor': mobile?.cursor ?? cursor,

    '--height': height,
    '--mobile-height': mobile?.height ?? height,

    '--width': width,
    '--mobile-width': mobile?.width ?? width,

    '--wrap': wrap,
    '--mobile-wrap': mobile?.wrap ?? wrap,

    '--background-image': backgroundOverlay
      ? `${backgroundOverlay}, url(${backgroundImageSrc})`
      : `url(${backgroundImageSrc})`,
    '--mobile-background-image': backgroundOverlay
      ? `${backgroundOverlay}, url(${mobile?.backgroundImageSrc ?? backgroundImageSrc})`
      : `url(${mobile?.backgroundImageSrc ?? backgroundImageSrc})`,

    '--aspect-ratio': aspectRatio,
    '--mobile-aspect-ratio': mobile?.aspectRatio ?? aspectRatio,

    '--justify-content': justifyContent,
    '--mobile-justify-content': mobile?.justifyContent ?? justifyContent,

    '--align-items': alignItems,
    '--mobile-align-items': mobile?.alignItems ?? alignItems,

    '--margin': margin,
    '--mobile-margin': mobile?.margin ?? margin,

    '--border': border,
    '--mobile-border': mobile?.border ?? border,

    '--border-radius': borderRadius,
    '--mobile-border-radius': mobile?.borderRadius ?? borderRadius,

    '--background-color': backgroundColor,
    '--mobile-background-color': mobile?.backgroundColor ?? backgroundColor,

    '--background-size': backgroundSize,
    '--mobile-background-size': mobile?.backgroundSize ?? backgroundSize,

    '--background-position': backgroundPosition,
    '--mobile-background-position': mobile?.backgroundPosition ?? backgroundPosition,

    '--background-repeat': backgroundRepeat,
    '--mobile-background-repeat': mobile?.backgroundRepeat ?? backgroundRepeat,
  } as React.CSSProperties;

  const handleEvent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (useEvent) {
      events.forEach((event) => {
        const customEvent = new CustomEvent(event.type, {
          detail: {
            targetId: event.targetId,
            data: event.data,
          },
        });
        console.log('Flex DISPATCHING EVENT', customEvent);
        window.dispatchEvent(customEvent);
      });
    }
  };
  const cmp = (
    <Section
      className={`${styles.flexSectionContainer} ${hideOnMobile ? 'hidden-mobile' : ''}
        ${hideOnDesktop ? 'hidden-desktop' : ''} ${hideOnTablet ? 'hidden-tablet' : ''}`}
      style={cssVariables}
      {...(useEvent ? { onClick: handleEvent } : {})}
    >
      <Items className={`${styles.flexItemsContainer} ${className}`} />
    </Section>
  );

  if (link !== undefined && link !== '' && link !== null && !useEvent) {
    return (
      <a href={link} className="flex-link-wrapper">
        {cmp}
      </a>
    );
  }
  return cmp;
};
