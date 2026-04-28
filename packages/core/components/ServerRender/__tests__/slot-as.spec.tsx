import React from "react";
import { renderToString } from "react-dom/server.node";
import { Config, Data } from "../../../types";
import { Render as ServerRender } from "../index";

describe("Slot as prop in Render contexts", () => {
  const config: Config = {
    components: {
      Grid: {
        fields: {
          items: { type: "slot" },
        },
        render: ({ items: Items, as }: any) => (
          <Items as={as} />
        ),
      },
      Image: {
        fields: {},
        render: () => <img src="placeholder.png" alt="test" />,
      },
    },
  };

  const data: Data = {
    root: { props: {} },
    content: [
      {
        type: "Grid",
        props: {
          id: "Grid-1",
          as: "ul",
          items: [
            {
              type: "Image",
              props: { id: "Image-1" },
            },
          ],
        },
      },
    ],
  };

  it("ServerRender: respects the `as` prop passed to a Slot component", () => {
    const html = renderToString(<ServerRender config={config} data={data} />);
    console.log("HTML:", html);
    expect(html).toContain("<ul");
    expect(html).not.toContain("<div");
  });
});
