import { act, render, screen } from "@testing-library/react";
import { Config } from "../../../types";
import "@testing-library/jest-dom";

jest.mock("../styles.module.css");
jest.mock("@dnd-kit/react");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false, // default → desktop
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(), // ⬅️ legacy APIs some libs still call
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

jest.mock("@dnd-kit/react", () => {
  const original = jest.requireActual("@dnd-kit/react");
  return {
    ...original,
    // Provider becomes a no-op wrapper
    DragDropProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),

    // Hooks return dummy objects so destructuring works
    useDroppable: () => ({
      ref: () => undefined,
      setNodeRef: () => undefined,
      isOver: false,
    }),
    useDraggable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: () => undefined,
      isDragging: false,
    }),
  };
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).ResizeObserver = ResizeObserver;

type PuckInternal = {
  appStore: AppStoreApi;
};

const getInternal = () => {
  return (window as any).__PUCK_INTERNAL_DO_NOT_USE as PuckInternal;
};

import { Puck } from "../index";
import { AppStoreApi } from "../../../store";

describe("Puck", () => {
  const componentARender = jest.fn(() => null);
  const componentBRender = jest.fn(() => null);
  const rootRender = jest.fn(() => null);

  const config: Config = {
    root: {
      render: ({ children }) => {
        rootRender();
        return <div>Root{children}</div>;
      },
    },
    components: {
      componentA: {
        render: () => {
          componentARender();
          return <div>Component A</div>;
        },
      },
      componentB: {
        render: () => {
          componentBRender();
          return <div>Component A</div>;
        },
      },
    },
  };

  afterEach(() => {
    rootRender.mockClear();
    componentARender.mockClear();
    componentBRender.mockClear();
  });

  // flush any queued state updates
  const flush = () => act(async () => {});

  it("root renders", async () => {
    render(<Puck config={config} data={{}} iframe={{ enabled: false }} />);

    await flush();

    expect(rootRender).toHaveBeenCalled();
    expect(screen.getByText("Root")).toBeInTheDocument();
  });

  it("should generate the correct state on mount", async () => {
    render(<Puck config={config} data={{}} iframe={{ enabled: false }} />);

    await flush();

    const { appStore } = getInternal();

    expect(appStore.getState()).toMatchSnapshot();
  });

  it("should respect `as` prop on a slot while the component is loading (read-only mode)", async () => {
    const gridRender = jest.fn((props: any) => {
      const { items: Items, as } = props;
      return <Items as={as} className="slot-wrapper" />;
    });

    render(
      <Puck
        config={{
          components: {
            Grid: {
              fields: {
                items: { type: "slot" },
                as: { type: "text" },
              },
              render: gridRender,
            },
            Child: {
              fields: {},
              render: () => <span>child</span>,
            },
          },
        }}
        data={{
          content: [
            {
              type: "Grid",
              props: {
                id: "grid-1",
                as: "ul",
                items: [{ type: "Child", props: { id: "child-1" } }],
              },
            },
          ],
        }}
        iframe={{ enabled: false }}
      />
    );

    await flush();

    const { appStore } = getInternal();

    // Simulate loading state — forces all slots to use ContextSlotRender (isReadOnly = true)
    act(() => {
      appStore.getState().setComponentState({ "grid-1": { loadingCount: 1 } });
    });

    await flush();

    // The slot wrapper must honour `as="ul"`, not fall back to `<div>`
    const slotEl = document.querySelector(".slot-wrapper");
    expect(slotEl).not.toBeNull();
    expect(slotEl!.tagName.toLowerCase()).toBe("ul");
  });

  it("should index slots on mount", async () => {
    render(
      <Puck
        config={{
          root: {
            fields: {
              content: { type: "slot" },
            },
          },
          components: {},
        }}
        data={{
          root: {
            props: {
              content: [],
            },
          },
        }}
        iframe={{ enabled: false }}
      />
    );

    await flush();

    const { appStore } = getInternal();

    expect(appStore.getState().state.indexes).toMatchInlineSnapshot(`
      {
        "nodes": {
          "root": {
            "data": {
              "props": {
                "content": [],
                "id": "root",
              },
              "type": "root",
            },
            "flatData": {
              "props": {
                "content": null,
                "id": "root",
              },
              "type": "root",
            },
            "parentId": null,
            "path": [],
            "zone": "",
          },
        },
        "zones": {
          "root:content": {
            "contentIds": [],
            "type": "slot",
          },
          "root:default-zone": {
            "contentIds": [],
            "type": "root",
          },
        },
      }
    `);
  });
});
