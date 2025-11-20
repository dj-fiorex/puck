import { useEffect, useRef, type ReactNode } from "react";

export type VideoProps = {
  videoId: string;
  useEvent: boolean;
  events: { type: string; targetId: string; data: unknown }[];
  src: string;
  posterSrc?: string;
  autoPlay: boolean;
  controls: boolean;
  loop: boolean;
  muted: boolean;
  width: string;
  height: string;
  maxWidth?: string;
  alignment: "left" | "center" | "right";
  caption: string;
  showCaption: boolean;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  borderRadius: string;
  objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  className?: string;
  mobile: {
    src: string;
  };
};

const alignmentClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

export const VideoRender = ({
  videoId: id = "video",
  useEvent = false,
  events = [],
  src,
  posterSrc,
  autoPlay,
  controls,
  loop,
  muted,

  width = "auto",
  height = "auto",
  maxWidth = "100%",
  alignment,
  caption,
  showCaption,
  borderWidth = "0px",
  borderColor = "#000000",
  borderStyle = "solid",
  borderRadius = "0px",
  objectFit,
  className = "",
  mobile,
}: VideoProps) => {
  const imageStyle = {
    width,
    height,
    maxWidth,
    objectFit,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    console.log("Video useEffect for event listener setup");
    if (typeof window !== "undefined") {
      console.log("Setting up video event listener for id:", id);
      const onEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        console.log("VIDEO EVENT TRIGGERED", customEvent);
        if (videoRef.current) {
          console.log("VIDEO REF CURRENT EXISTS", videoRef.current);
          const { detail } = customEvent;
          console.log("VIDEO EVENT RECEIVED", detail);
          const { targetId, data = "{}" } = detail;
          if (targetId && targetId === id) {
            let restartVideo = false;
            try {
              const parsedData = JSON.parse(data);
              console.log("Parsed event data:", parsedData);
              restartVideo = parsedData.restart || false;
            } catch (error) {
              console.error("Error parsing event data:", error);
            }
            if (videoRef.current.paused) {
              if (restartVideo) {
                videoRef.current.currentTime = 0;
              }
              videoRef.current.play().catch(() => {
                console.error("Video play failed");
              });
            } else {
              videoRef.current.pause();
              if (restartVideo) {
                videoRef.current.currentTime = 0;
              }
            }
          }
        }
      };
      window.addEventListener("video:togglePlay", onEvent);
      return () => {
        window.removeEventListener("video:togglePlay", onEvent);
      };
    }
  }, [id, videoRef]);

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

    console.log("Setting up video element and resize listener");

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

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    if (useEvent) {
      events.forEach((event) => {
        const customEvent = new CustomEvent(event.type, {
          detail: {
            targetId: event.targetId,
            data: event.data,
          },
        });
        console.log("Video DISPATCHING EVENT", customEvent);
        window.dispatchEvent(customEvent);
      });
    }
  };

  const withCaption = (element: ReactNode) => {
    return (
      <div
        className={`block ${alignmentClasses[alignment]}`}
        {...(useEvent ? { onClick: handleClick } : {})}
      >
        {element}
        {showCaption && caption && (
          <p className="mt-2 text-center text-sm text-gray-500">{caption}</p>
        )}
      </div>
    );
  };

  const VideoInternal = (
    <video
      ref={videoRef}
      playsInline
      className={`${className} puck-video`}
      autoPlay={autoPlay}
      controls={controls}
      loop={loop}
      muted={muted}
      style={imageStyle}
      {...(posterSrc ? { poster: posterSrc } : {})}
      {...(useEvent && !showCaption ? { onClick: handleClick } : {})}
    >
      <source src={src} media="(min-width: 800px)" />
      <source src={mobile?.src ?? src} media="(max-width: 799px)" />
      Your browser does not support the video tag.
    </video>
  );

  return showCaption && caption ? withCaption(VideoInternal) : VideoInternal;
};
