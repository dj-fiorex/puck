/* eslint-disable react-hooks/rules-of-hooks */

import { type PuckComponent, type Slot } from '@measured/puck';
import { useEffect, useMemo, useRef, useState } from 'react';
// import Swiper core and required modules
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions, Swiper as SwiperType } from 'swiper/types';
// Import Swiper styles
import './styles.css'; // Ensure you have the correct path to your Swiper styles
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type SwiperSliderProps = {
  slidesObj: Array<{
    items: Slot;
  }>;
  current: number;
  slidesPerPage: number;
  spaceBetween: number;
  loop: boolean;
  autoHeight: boolean;
  speed: number;
  autoplay: {
    enabled: boolean;
    disableOnInteraction: boolean;
    delay: number;
  };
  navigation: {
    enabled: boolean;
    placement: 'outside' | 'inside' | 'bottom' | 'bottom-left' | 'bottom-right';
  };
  pagination: {
    enabled: boolean;
    type: 'normal' | 'dynamic' | 'progress';
    bulletsCss?: string;
    bulletActiveCss?: string;
    bulletsContainerCss?: string;
    paginationProgressCss?: string;
    paginationProgressFillCss?: string;
  };
  breakpoints: {
    slidesPerView: number;
    breakPoint: number;
    spaceBetween: number;
  }[];
  id?: string;
  className?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
};
// useSwiperRef
const useSwiperRef = () => {
  const [wrapper, setWrapper] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    setWrapper(ref.current);
  }, []);

  return [wrapper, ref];
};

export default useSwiperRef;

export const SwiperSliderRender: PuckComponent<SwiperSliderProps> = (props) => {
  const {
    id = '',
    slidesObj,
    current,
    slidesPerPage,
    spaceBetween,
    loop = false,
    autoHeight = false,
    speed = 1000,
    autoplay = {
      enabled: false,
      delay: 1000,
      disableOnInteraction: false,
    },
    navigation = {
      enabled: false,
      placement: 'outside',
    },
    pagination = {
      enabled: false,
      type: 'normal',
    },
    breakpoints = [],
    className = '',
    puck,
    hideOnDesktop = false,
    hideOnMobile = false,
    hideOnTablet = false,
  } = props;

  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  const [paginationEl, paginationRef] = useSwiperRef();

  useEffect(() => {
    // if current changes, change slide with swiper
    if (swiper) {
      swiper.slideTo(current);
    }
  }, [current, swiper]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (swiper) {
          const { detail } = customEvent;
          if (detail && detail.current !== undefined && detail.id === id) {
            swiper.slideTo(detail.current);
          }
        }
      };
      window.addEventListener('puck:slideChange', onEvent);
      return () => {
        window.removeEventListener('puck:slideChange', onEvent);
      };
    }
  }, [swiper, id]);

  const swiperOptions = useMemo(() => {
    const modules = autoplay.enabled ? [Autoplay] : [];
    if (navigation.enabled) {
      modules.push(Navigation);
    }
    if (pagination.enabled) {
      modules.push(Pagination);
    }

    return {
      allowTouchMove: !puck?.isEditing,
      spaceBetween,
      slidesPerView: slidesPerPage,
      loop,
      modules,
      speed,
      autoHeight,

      breakpoints: breakpoints.reduce(
        (acc, breakpoint) => {
          acc[breakpoint.breakPoint] = {
            slidesPerView: breakpoint.slidesPerView,
            spaceBetween: breakpoint.spaceBetween,
          };
          return acc;
        },
        {} as Record<number, { slidesPerView: number; spaceBetween: number }>,
      ),
      autoplay: autoplay.enabled
        ? {
            delay: autoplay.delay,
            disableOnInteraction: autoplay.disableOnInteraction,
          }
        : false,
      navigation: navigation.enabled
        ? {
            enabled: true,
            ...(navigation.placement === 'outside' && {
              nextEl: '.swiper-button-next-outside',
              prevEl: '.swiper-button-prev-outside',
            }),
            ...(navigation.placement === 'inside' && {
              nextEl: '.swiper-button-next-inside',
              prevEl: '.swiper-button-prev-inside',
            }),
            ...(navigation.placement === 'bottom' && {
              nextEl: '.swiper-button-next-bottom',
              prevEl: '.swiper-button-prev-bottom',
            }),
            ...(navigation.placement === 'bottom-left' && {
              nextEl: '.swiper-button-next-bottom-left',
              prevEl: '.swiper-button-prev-bottom-left',
            }),
            ...(navigation.placement === 'bottom-right' && {
              nextEl: '.swiper-button-next-bottom-right',
              prevEl: '.swiper-button-prev-bottom-right',
            }),
          }
        : false,
      pagination: pagination.enabled
        ? pagination.type === 'normal'
          ? {
              enabled: true,
              type: 'bullets',
              clickable: true,
              el: paginationEl as unknown as string, //'.swiper-pagination-custom', //paginationRef?.current,
            }
          : {
              dynamicBullets: pagination.type === 'dynamic' ? true : undefined,
              ...(pagination.type === 'progress'
                ? {
                    type: 'progressbar',
                  }
                : {}),
            }
        : false,
    } satisfies SwiperOptions;
  }, [
    autoplay.enabled,
    navigation.enabled,
    pagination.enabled,
    spaceBetween,
    slidesPerPage,
    loop,
    speed,
    autoHeight,
    breakpoints,
    autoplay.delay,
    autoplay.disableOnInteraction,
    navigation.placement,
    pagination.type,
    puck?.isEditing,
    paginationEl,
  ]);

  const swiperPaginationOverride = useMemo(() => {
    return `
    .swiper-pagination-bullet {
      ${pagination?.bulletsCss ?? 'background: #999;'}
    }
    .swiper-pagination-bullet-active {
      ${pagination?.bulletActiveCss ?? 'background: #FFFFFF;'}
    }
    .swiper-pagination-custom {
      ${pagination?.bulletsContainerCss ?? 'display: flex; justify-content: center; margin-top: 20px;'}
    }

    .swiper-pagination-progressbar {
      ${pagination?.paginationProgressCss ?? 'top: unset !important; bottom: 0 !important;'}
    }
    
    .swiper-pagination-progressbar-fill {
      ${pagination?.paginationProgressFillCss ?? 'background: black !important;'}
    }

    /* This is to fix the slider when it is empty and swiper is inside a flex or grid */
    .swiper-slide > div:empty {
      width: 100vw;
    }
    `;
  }, [
    pagination.bulletsCss,
    pagination.bulletActiveCss,
    pagination.bulletsContainerCss,
    pagination.paginationProgressCss,
    pagination.paginationProgressFillCss,
  ]);

  return (
    <>
      <style id={'STILE_TEST_SWIPER'}>{swiperPaginationOverride}</style>

      <Swiper
        {...swiperOptions}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => setSwiper(swiper)}
        className={`${className} ${hideOnMobile ? 'hidden-mobile' : ''} ${hideOnDesktop ? 'hidden-desktop' : ''} ${hideOnTablet ? 'hidden-tablet' : ''}`}
      >
        {slidesObj.map((slide, index) => {
          const { items: Items } = slide;
          return (
            <SwiperSlide key={index}>
              <Items />
            </SwiperSlide>
          );
        })}
        {navigation.enabled && (
          <>
            {/* Outside */}
            {navigation.placement === 'outside' && (
              <>
                <div className="swiper-button swiper-button-prev-outside">
                  <ChevronLeft />
                </div>
                <div className="swiper-button swiper-button-next-outside">
                  <ChevronRight />
                </div>
              </>
            )}
            {/* Inside */}
            {navigation.placement === 'inside' && (
              <>
                <div className="swiper-button swiper-button-prev-inside">
                  <ChevronLeft />
                </div>
                <div className="swiper-button swiper-button-next-inside">
                  <ChevronRight />
                </div>
              </>
            )}
            {/* Bottom */}
            {navigation.placement === 'bottom' && (
              <>
                <div className="swiper-button swiper-button-prev-bottom">
                  <ChevronLeft />
                </div>
                <div className="swiper-button swiper-button-next-bottom">
                  <ChevronRight />
                </div>
              </>
            )}
            {/* Bottom Left */}
            {navigation.placement === 'bottom-left' && (
              <>
                <div className="swiper-button swiper-button-prev-bottom-left">
                  <ChevronLeft />
                </div>
                <div className="swiper-button swiper-button-next-bottom-left">
                  <ChevronRight />
                </div>
              </>
            )}
            {/* Bottom Right */}
            {navigation.placement === 'bottom-right' && (
              <>
                <div className="swiper-button swiper-button-prev-bottom-right">
                  <ChevronLeft />
                </div>
                <div className="swiper-button swiper-button-next-bottom-right">
                  <ChevronRight />
                </div>
              </>
            )}
          </>
        )}
        {pagination.enabled && <div className="swiper-pagination-custom" ref={paginationRef} />}
      </Swiper>
    </>
  );
};
