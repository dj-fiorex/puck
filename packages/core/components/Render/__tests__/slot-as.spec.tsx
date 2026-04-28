import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Config, Data } from "../../../types";

// Mock ResizeObserver (needed by @dnd-kit)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).ResizeObserver = ResizeObserver;

jest.mock("../styles.module.css", () => ({}), { virtual: true });
jest.mock("../../DropZone/styles.module.css", () => ({}), { virtual: true });

jest.mock("@dnd-kit/react", () => {
  const original = jest.requireActual("@dnd-kit/react");
  return {
    ...original,
    DragDropProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useDroppable: () => ({
      ref: () => undefined,
      setNodeRef: () => undefined,
      isOver: false,
    }),
  };
});

import { Render } from "../index";

describe("Client-side Render: Slot as prop", () => {
  // Grid component exactly matching the user's implementation
  const config: Config = {
    components: {
      Grid: {
        fields: {
          items: { type: "slot" },
          as: {
            type: "select",
            options: [
              { value: "div", label: "div" },
              { value: "ul", label: "ul" },
              { value: "ol", label: "ol" },
            ],
          },
          numColumns: { type: "number" },
          gap: { type: "text" },
        },
        render: (props: any) => {
          const {
            as = "div",
            items: Items,
            mobile,
            tablet,
            ...desktop
          } = props;

          const { gap, numColumns } = desktop;

          const cssProps = {
            "--gap": gap,
            "--num-columns": numColumns,
          } as React.CSSProperties;

          return (
            <Items as={as} className="grid-class" style={cssProps} />
          );
        },
      },
      Image: {
        fields: {
          src: { type: "text" },
          layout: {
            type: "object",
            objectFields: {
              as: { type: "text" },
              spanCol: { type: "number" },
            },
          },
        },
        render: ({ layout, src }: any) => {
          const El = layout?.as || "div";
          return <El className="image-wrapper"><img src={src} alt="test" /></El>;
        },
      },
    },
  };

  // Exact data structure from the user's example
  const data: Data = {
    root: { props: {} },
    content: [
      {
        type: "Grid",
        props: {
          id: "Grid-85fd4017-7960-45a0-9d37-1d27ea51cd2f",
          as: "ul",
          numColumns: 4,
          gap: "24px",
          mobile: { numColumns: 1, gap: "0px" },
          tablet: { numColumns: 4, gap: "24px" },
          items: [
            {
              type: "Image",
              props: {
                id: "Image-1bb75ed6-f1d9-46de-99f7-8defcac2ff4a",
                src: "https://example.com/placeholder.png",
                layout: {
                  spanCol: 1,
                  as: "div",
                },
              },
            },
            {
              type: "Image",
              props: {
                id: "Image-79298dbc-dedb-4309-b027-4db7bfe65aa5",
                src: "https://example.com/placeholder2.png",
                layout: {
                  spanCol: 1,
                  as: "div",
                },
              },
            },
          ],
        },
      },
    ],
  };

  it("Slot wrapper renders as 'ul' when as='ul' is passed", () => {
    const { container } = render(<Render config={config} data={data} />);

    // The slot wrapper should be <ul>, NOT <div>
    const gridEl = container.querySelector(".grid-class");
    expect(gridEl).toBeInTheDocument();
    expect(gridEl?.tagName.toLowerCase()).toBe("ul");
  });

  it("Image items inside slot render as 'div' (from their own layout.as)", () => {
    const { container } = render(<Render config={config} data={data} />);
    const imageWrappers = container.querySelectorAll(".image-wrapper");
    imageWrappers.forEach((el) => {
      expect(el.tagName.toLowerCase()).toBe("div");
    });
  });
});
