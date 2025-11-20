import { useMemo, type ReactNode } from "react";

import { useCallback, useEffect, useState } from "react";

const useIsMobile = (mobileScreenSize = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${mobileScreenSize}px)`).matches
      : false
  );

  const checkIsMobile = useCallback((event: MediaQueryListEvent) => {
    setIsMobile(event.matches);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaListener = window.matchMedia(
      `(max-width: ${mobileScreenSize}px)`
    );
    // try catch used to fallback for browser compatibility
    try {
      mediaListener.addEventListener("change", checkIsMobile);
    } catch {
      mediaListener.addListener(checkIsMobile);
    }

    return () => {
      if (typeof window === "undefined") {
        return;
      }
      try {
        mediaListener.removeEventListener("change", checkIsMobile);
      } catch {
        mediaListener.removeListener(checkIsMobile);
      }
    };
  }, [mobileScreenSize, checkIsMobile]);

  return isMobile;
};

type BaseImageProps = {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  aspectRatio?: number;
  alignment?: "left" | "center" | "right";
  caption?: string;
  showCaption?: boolean;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  linkUrl?: string;
  openInNewTab?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  className?: string;
};

export type ImageProps = BaseImageProps & {
  mobile: BaseImageProps;
};

const alignmentClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

const shadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export const ImageRender = ({ mobile, ...desktop }: ImageProps) => {
  //console.log('mobile', mobile);
  const isMobile = useIsMobile();

  const props = useMemo(() => {
    return {
      ...desktop,
      ...(isMobile ? mobile : {}),
    };
  }, [desktop, isMobile, mobile]);

  const {
    src,
    alt = "",
    width = "auto",
    height = "auto",
    maxWidth = "100%",
    aspectRatio = 0,
    alignment = "center",
    caption = "",
    showCaption = false,
    borderWidth = "0px",
    borderColor = "#000000",
    borderStyle = "none",
    borderRadius = "0px",
    shadow = "none",
    linkUrl = "",
    openInNewTab = false,
    objectFit = "cover",
    className = "",
  } = props;

  const imageStyle = {
    width,
    height,
    maxWidth,
    objectFit,
    ...(aspectRatio !== 0 ? { aspectRatio } : {}),
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
  };

  const withCaption = (element: ReactNode) => {
    return (
      <div className={`block ${alignmentClasses[alignment]}`}>
        {element}
        {showCaption && caption && (
          <p className="mt-2 text-center text-sm text-gray-500">{caption}</p>
        )}
      </div>
    );
  };

  const ImageInternal = (
    <img
      src={src}
      alt={alt}
      className={`${shadowClasses[shadow]} ${className}`}
      style={imageStyle}
    />
  );

  const ImageComponent =
    showCaption && caption ? withCaption(ImageInternal) : ImageInternal;

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target={openInNewTab ? "_blank" : "_self"}
        rel={openInNewTab ? "noopener noreferrer" : ""}
      >
        {ImageComponent}
      </a>
    );
  }

  return ImageComponent;
};
