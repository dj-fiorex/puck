import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";
import "./button.styles.css";
import { mergeDeep } from "./utility/mergeObjects";
import { useRef } from "react";

const generateRandomString = (length: number, prefix: string) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return prefix ? prefix + result : result;
};

interface ButtonInternalProps extends React.ComponentProps<"button"> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const ButtonInternal = ({
  id,
  className = "",
  asChild = false,
  ...props
}: ButtonInternalProps) => {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" id={id} className={className} {...props} />;
};

export type ButtonBaseProps = {
  useEvent: boolean;
  events?: { type: string; targetId: string; data: unknown }[];
  label: string;
  href: string;
  variant: "primary" | "secondary" | "destructive" | "outline" | "link";
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textShadow?: string;

  padding?: string;
  margin?: string;
  border?: string;
  borderRadius?: string;

  textDecorationLine?: string;
  textDecorationStyle?: string;
  textDecorationThickness?: string;
  textUnderlineOffset?: string;
  textDecorationColor?: string;

  size: "default" | "sm" | "lg";
  align?: string;

  className?: string;
  tabIndex?: number;
  position?: string;
  display?: string;
  width?: string;
  afterCss?: string;
  hoverAfterCss?: string;
};

export type ButtonProps = ButtonBaseProps & {
  mobile?: ButtonBaseProps;
};

export const Button = (props: ButtonProps) => {
  const { mobile = {}, useEvent = false, events = [], ...rest } = props;

  const {
    label,
    href,
    variant,
    backgroundColor,
    textColor,
    fontFamily,
    fontSize = "16px",
    fontWeight,
    size,
    className,
    tabIndex,
    fontStyle,
    textDecorationLine = "none",
    textDecorationStyle = "none",
    textDecorationThickness = "0px",
    textUnderlineOffset = "0px",
    textDecorationColor = "#000000",
    padding,
    margin,
    border,
    borderRadius,
    textShadow = "none",
    afterCss = "",
    hoverAfterCss = "",
    position = "static",
    display = "inline-flex",
    width = "auto",
  } = rest;

  const mobileFixedProps = mergeDeep(mobile, rest, { priority: "left" });
  // Create CSS variables object for desktop and mobile
  const cssVariables: Record<string, string> = {
    "--button-background-color":
      backgroundColor ??
      (variant === "primary" ? "var(--primary)" : "var(--secondary)"),
    "--button-text-color": textColor ?? "white",
    "--button-font-family": fontFamily ?? "inherit",
    "--button-font-size": fontSize,
    "--button-font-weight": fontWeight ?? "normal",
    "--button-font-style": fontStyle ?? "normal",
    "--button-padding":
      padding ??
      (size === "sm"
        ? "0.375rem 0.75rem"
        : size === "lg"
        ? "0.625rem 1.5rem"
        : "0.5rem 1rem"),
    "--button-margin": margin ?? "0",
    "--button-border": border ?? "1px solid transparent",
    "--button-border-radius": borderRadius ?? "0.375rem",
    "--button-text-shadow": textShadow,
    "--button-text-decoration-line": textDecorationLine,
    "--button-text-decoration-style": textDecorationStyle,
    "--button-text-decoration-thickness": textDecorationThickness,
    "--button-text-underline-offset": textUnderlineOffset,
    "--button-text-decoration-color": textDecorationColor,
    "--button-position": position,
    "--button-display": display,
    "--button-width": width,
  };

  // Add mobile-specific CSS variables if mobile props are provided
  cssVariables["--mobile-button-background-color"] =
    mobileFixedProps.backgroundColor ??
    cssVariables["--button-background-color"];
  cssVariables["--mobile-button-text-color"] =
    mobileFixedProps.textColor ?? cssVariables["--button-text-color"];
  cssVariables["--mobile-button-font-family"] =
    mobileFixedProps.fontFamily ?? cssVariables["--button-font-family"];
  cssVariables["--mobile-button-font-size"] =
    mobileFixedProps.fontSize ?? "14px";
  cssVariables["--mobile-button-font-weight"] =
    mobileFixedProps.fontWeight ?? cssVariables["--button-font-weight"];
  cssVariables["--mobile-button-font-style"] =
    mobileFixedProps.fontStyle ?? cssVariables["--button-font-style"];
  cssVariables["--mobile-button-padding"] =
    mobileFixedProps.padding ??
    (mobileFixedProps.size === "sm"
      ? "0.3rem 0.6rem"
      : mobileFixedProps.size === "lg"
      ? "0.5rem 1.2rem"
      : "0.4rem 0.8rem");
  cssVariables["--mobile-button-margin"] =
    mobileFixedProps.margin ?? cssVariables["--button-margin"];
  cssVariables["--mobile-button-border"] =
    mobileFixedProps.border ?? cssVariables["--button-border"];
  cssVariables["--mobile-button-border-radius"] =
    mobileFixedProps.borderRadius ?? cssVariables["--button-border-radius"];
  cssVariables["--mobile-button-text-shadow"] =
    mobileFixedProps.textShadow ?? cssVariables["--button-text-shadow"];

  cssVariables["--mobile-button-text-decoration-line"] =
    mobileFixedProps.textDecorationLine ??
    cssVariables["--button-text-decoration-line"];
  cssVariables["--mobile-button-text-decoration-style"] =
    mobileFixedProps.textDecorationStyle ??
    cssVariables["--button-text-decoration-style"];
  cssVariables["--mobile-button-text-decoration-thickness"] =
    mobileFixedProps.textDecorationThickness ??
    cssVariables["--button-text-decoration-thickness"];
  cssVariables["--mobile-button-text-underline-offset"] =
    mobileFixedProps.textUnderlineOffset ??
    cssVariables["--button-text-underline-offset"];
  cssVariables["--mobile-button-text-decoration-color"] =
    mobileFixedProps.textDecorationColor ??
    cssVariables["--button-text-decoration-color"];
  cssVariables["--mobile-button-position"] =
    mobileFixedProps.position ?? cssVariables["--button-position"];
  cssVariables["--mobile-button-display"] =
    mobileFixedProps.display ?? cssVariables["--button-display"];
  cssVariables["--mobile-button-width"] =
    mobileFixedProps.width ?? cssVariables["--button-width"];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (useEvent) {
      events.forEach((event) => {
        const customEvent = new CustomEvent(event.type, {
          detail: {
            targetId: event.targetId,
            data: event.data,
          },
        });
        console.log("DISPATCHING EVENT", customEvent);
        window.dispatchEvent(customEvent);
      });
    }
  };

  const btnId = useRef(generateRandomString(5, "btn-"));

  return (
    <>
      <style>
        {`
        #${btnId.current}:after {
         ${afterCss} 
        }
        `}
        {`
        #${btnId.current}:hover:after {
         ${hoverAfterCss} 
        }
        `}
      </style>
      <ButtonInternal
        id={btnId.current}
        className={`skin-button button ${className || ""}`}
        {...(!useEvent ? { asChild: true } : {})}
        tabIndex={tabIndex}
        style={cssVariables}
        {...(useEvent ? { onClick: (e) => handleClick(e) } : {})}
      >
        {!useEvent ? <a href={href}>{label}</a> : label}
      </ButtonInternal>
    </>
  );
};
