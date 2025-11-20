"use client";
import { createUsePuck } from "@measured/puck";


import { useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useDeepCompareCallback } from "use-deep-compare";
import { v4 as uuidv4 } from "uuid";
import { traverseBlocks } from "./traverseBlocks";
const usePuck = createUsePuck();

const deleteLocalCache = async (metadata: any) => {
  metadata.refetchProducts();
};

export const DefaultHeaderActions = ({
  PreSlot,
  PostSlot,
  metadata,
}: {
  PreSlot?: (usePuck) => React.ReactNode;
  PostSlot?: (usePuck) => React.ReactNode;
  metadata?: Record<string, any>;
}) => {
  const dispatch = usePuck((state) => state.dispatch);
  const content = usePuck((state) => state.appState.data.content);

  const [loading, setLoading] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");

  const onDeleteLocalCache = async () => {
    setLoading(true);
    try {
      await deleteLocalCache(metadata);
    } catch (error) {
      console.error("Error clearing local cache:", error);
    } finally {
      setLoading(false);
    }
  };

  const onExportBlocks = useDeepCompareCallback(
    (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      noTemplates = false
    ) => {
      event.preventDefault();
      if (!noTemplates) {
        //console.log("Copy", content);
        navigator.clipboard.writeText(JSON.stringify(content, null, 2));
      } else {
        //console.log("Copy no templates", content);

        const cleanContent = traverseBlocks(
          content,
          () => {},
          (block) => {
            // if block is a template, return
            if (
              (block.type.startsWith("TMP-") ||
                block?.props?.id?.startsWith("TMP-")) &&
              block?.props?.children?.length > 0
            ) {
              return block.props.children;
            }
            return block;
          }
        );

        //console.log("Clean content", cleanContent);

        navigator.clipboard.writeText(JSON.stringify(cleanContent, null, 2));
      }
    },
    [content]
  );

  const handleImportBlock = () => {
    try {
      setJsonError("");
      const parsedJson = JSON.parse(jsonInput);

      // Parsed json could be a single block or an array of blocks
      const blocks = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      let errors: string[] = [];
      for (const [index, block] of blocks.entries()) {
        // Validate that it's a valid block structure
        if (!block.type || !block.props) {
          errors.push(
            `Block at index ${index} is missing 'type' or 'props' properties.`
          );
        }
      }

      if (errors.length > 0) {
        setJsonError(errors.join(" "));
        return;
      }

      const cleanBlocks = traverseBlocks(
        blocks,
        () => {},
        (block) => {
          const { type, props } = block;
          const { id, ...allProps } = props;
          return {
            type,
            props: {
              ...allProps,
              // Generate a new id for the imported block
              id: `${id.split("-")[0]}-${uuidv4()}`,
            },
          };
        }
      );

      dispatch({
        type: "setData",
        data: {
          content: [...content, ...cleanBlocks],
        },
      });
      // You might want to show a success message here
      setIsImportModalOpen(false);
      setJsonInput("");
      setJsonError("");
    } catch (error) {
      console.warn("Error parsing JSON:", error);
      setJsonError("Invalid JSON format. Please check your JSON syntax.");
    }
  };
  return (
    <>
      <div className="flex items-center gap-2 space-x-2">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Menu</MenubarTrigger>
            <MenubarContent>
              {PreSlot?.(usePuck)}

              <MenubarSub>
                <MenubarSubTrigger>Import/Export</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={(event) => onExportBlocks(event, true)}>
                    Export Blocks
                  </MenubarItem>
                  <MenubarItem
                    onClick={(event) => onExportBlocks(event, false)}
                  >
                    Export Blocks (with Template reference)
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => {
                      setIsImportModalOpen(true);
                    }}
                  >
                    Import Blocks
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSub>
                <MenubarSubTrigger>Maintenance</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem
                    disabled={loading}
                    variant="info"
                    onClick={async () => {
                      await onDeleteLocalCache();
                    }}
                  >
                    Sync Local Products
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>

              {PostSlot?.(usePuck)}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-h-[80vh] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Block</DialogTitle>
            <DialogDescription>
              Paste the JSON code of the block you want to import. Make sure
              it's a valid block structure with 'type' and 'props' properties.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Paste your JSON block code here..."
              onBlur={(e) => setJsonInput(e.target.value)}
              className="max-h-[50vh] min-h-[200px] overflow-auto font-mono text-sm"
            />
            {jsonError && (
              <div className="text-sm text-red-500">{jsonError}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportModalOpen(false);
                setJsonInput("");
                setJsonError("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImportBlock} disabled={!jsonInput.trim()}>
              Import Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
