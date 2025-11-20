import type { PuckComponent } from "@measured/puck";
import { useEffect, useRef } from "react";
import type { FlexProps } from "../Flex/flex";
import styles from "./flex-video.module.css";

export type FlexVideoProps = FlexProps & {
  videoSrc?: string;
  videoMobileSrc?: string; // Optional prop for mobile video source
  videoShowControls?: boolean;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
  useOverlay?: boolean; // Optional prop to control overlay visibility
  className?: string; // Optional className prop
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
};

export const FlexVideoRender: PuckComponent<FlexVideoProps> = ({
  justifyContent,
  alignItems,
  direction,
  gap,
  wrap,
  // link,
  margin = "auto",
  border = "none",
  borderRadius = "0px",
  backgroundColor,
  backgroundImageSrc,
  aspectRatio,
  backgroundOverlay,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  height = "100%",
  width = "100%",
  items: Items,
  className = "",
  mobile,

  // Video specific props,
  videoSrc,
  videoMobileSrc,
  videoShowControls,
  videoAutoplay,
  videoLoop,
  videoMuted,
  useOverlay = false,
  hideOnDesktop = false,
  hideOnMobile = false,
  hideOnTablet = false,
}) => {
  // Generate CSS custom properties for dynamic values
  const cssVariables = {
    "--flex-direction": direction,
    "--mobile-flex-direction": mobile?.direction ?? direction,

    "--gap": gap ? `${gap}px` : 0,
    "--mobile-gap": mobile?.gap ? `${mobile.gap}px` : gap ? `${gap}px` : 0,

    "--height": height,
    "--mobile-height": mobile?.height ?? height,

    "--width": width,
    "--mobile-width": mobile?.width ?? width,

    "--wrap": wrap,
    "--mobile-wrap": mobile?.wrap ?? wrap,

    "--background-image": backgroundOverlay
      ? `${backgroundOverlay}, url(${backgroundImageSrc})`
      : `url(${backgroundImageSrc})`,
    "--mobile-background-image": backgroundOverlay
      ? `${backgroundOverlay}, url(${
          mobile?.backgroundImageSrc ?? backgroundImageSrc
        })`
      : `url(${mobile?.backgroundImageSrc ?? backgroundImageSrc})`,

    "--aspect-ratio": aspectRatio,
    "--mobile-aspect-ratio": mobile?.aspectRatio ?? aspectRatio,

    "--justify-content": justifyContent,
    "--mobile-justify-content": mobile?.justifyContent ?? justifyContent,

    "--align-items": alignItems,
    "--mobile-align-items": mobile?.alignItems ?? alignItems,

    "--margin": margin,
    "--mobile-margin": mobile?.margin ?? margin,

    "--border": border,
    "--mobile-border": mobile?.border ?? border,

    "--border-radius": borderRadius,
    "--mobile-border-radius": mobile?.borderRadius ?? borderRadius,

    "--background-color": backgroundColor,
    "--mobile-background-color": mobile?.backgroundColor ?? backgroundColor,

    "--background-size": backgroundSize,
    "--mobile-background-size": mobile?.backgroundSize ?? backgroundSize,

    "--background-position": backgroundPosition,
    "--mobile-background-position":
      mobile?.backgroundPosition ?? backgroundPosition,

    "--background-repeat": backgroundRepeat,
    "--mobile-background-repeat": mobile?.backgroundRepeat ?? backgroundRepeat,
  } as React.CSSProperties;

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Evita errori in SSR
    if (typeof window === "undefined") {
      console.log("SSR detected, skipping video setup");
      return;
    }

    console.log("NAVIGATOR USER AGENT", navigator.userAgent);

    // Check that user agent is not android or ios
    const isMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      console.log("Mobile device detected, skipping video setup");
      return;
    }

    console.log("Setting up video element and resize listener BLABLABLA");

    let resizeTO: ReturnType<typeof setTimeout>;

    function handleResize() {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        console.log("Window resized, updating video sources if needed");
        if (videoRef.current) {
          const wasPlaying = !videoRef.current.paused;
          videoRef.current.load(); // forza il ricalcolo delle <source media>
          if (wasPlaying) {
            videoRef.current.play().catch(() => {});
          }
        }
      }, 150);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTO);
      window.removeEventListener("resize", handleResize);
    };
  }, [videoRef]);

  return (
    <div
      className={`${styles.container} ${className} ${
        hideOnMobile ? "hidden-mobile" : ""
      }
        ${hideOnDesktop ? "hidden-desktop" : ""} ${
        hideOnTablet ? "hidden-tablet" : ""
      }`}
    >
      {/* Background Video */}
      {videoSrc || videoMobileSrc ? (
        <video
          ref={videoRef}
          playsInline
          className={`${styles.video} background-video`}
          controls={videoShowControls}
          autoPlay={videoAutoplay}
          loop={videoLoop}
          muted={videoMuted}
        >
          <source src={videoSrc} media="(min-width: 800px)" />
          <source src={videoMobileSrc} media="(max-width: 799px)" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className={styles.placeholder}>No video source provided.</div>
      )}

      {/* Dark overlay for better text readability */}
      {useOverlay && <div className={styles.overlay} />}

      {/* Content overlay */}
      <div className={styles.content}>
        <Items
          className={`${styles.flexVideoItemsContainer}`}
          style={cssVariables}
        />
      </div>
    </div>
  );
};
