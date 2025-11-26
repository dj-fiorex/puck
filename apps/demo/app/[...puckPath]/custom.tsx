"use client";
import dynamic from "next/dynamic";

import { Button as _Button } from "../app/_components/ui/button";

import Link from "next/link";

const CustomPuck = dynamic(() => import("../app/_components/CustomPuck"), {
  ssr: false,
});

// import { CustomPuck } from "@/app/_components/puck/CustomPuck";

import { PuckAction } from "@measured/puck";

import { useResolvedConfig } from "../../config/hooks/useResolvedConfig";

/**
 * Substitutes template type identifiers in a content object by adding or removing the "TMP-" prefix.
 *
 * This function performs a bidirectional transformation on template type identifiers within a JSON-serializable
 * content object. It can either remove the "TMP-" prefix (when reading from database) or add it (when preparing
 * data for storage).
 *
 * @param content - The content object containing template references with type properties to be transformed.
 *                  This can be any JSON-serializable object structure.
 * @param allTemplates - An array of template objects, each containing a `name` property with the format "TMP-<templateType>".
 *                       These templates are used to determine which type identifiers should be transformed.
 * @param fromDb - A boolean flag indicating the direction of transformation:
 *                 - `true` (default): Removes "TMP-" prefix from type identifiers (database → application format)
 *                 - `false`: Adds "TMP-" prefix to type identifiers (application → database format)
 *
 * @returns A new object with transformed template type identifiers. The returned object is a deep copy
 *          of the input content with modified type properties.
 * @remarks
 * - The function uses JSON serialization/deserialization internally, so the input must be JSON-serializable
 * - All occurrences of matching type patterns will be replaced throughout the nested structure
 * - Template names in the `allTemplates` array must follow the "TMP-<templateType>" naming convention
 */
const substituteTemplatesType = (
  content: any,
  allTemplates: any[],
  fromDb = true
) => {
  const allTemplatesType = allTemplates.map((t) =>
    t.name.replaceAll("TMP-", "")
  );

  // Substitute <template.type> with TMP-<template.type>
  let str = JSON.stringify(content);

  for (const templateType of allTemplatesType) {
    if (fromDb) {
      str = str.replaceAll(
        `"type":"TMP-${templateType}"`,
        `"type":"${templateType}"`
      );
    } else {
      str = str.replaceAll(
        `"type":"${templateType}"`,
        `"type":"TMP-${templateType}"`
      );
    }
  }

  return JSON.parse(str);
};

const fields = {
  //name: { type: "text" },
  // url: { type: "text" },
  // isHome: {
  //   type: "radio",
  //   options: [
  //     { label: "False", value: false },
  //     { label: "True", value: true },
  //   ],
  // },
  stores: {
    type: "custom",
    render: ({ value }) => {
      if (!value || value.length === 0) {
        return null;
      }
      return (
        <div className="flex flex-col">
          <p>
            Name: <strong>{value[0]?.name}</strong>
          </p>
          <p>
            Stores: <strong>{value.map((s) => s.store).join(", ")}</strong>
          </p>
        </div>
      );
    },
  },

  status: {
    type: "custom",
    render: ({ value }) => {
      return (
        <p>
          Status: <strong>{value}</strong>
        </p>
      );
    },
  },
  createdAt: {
    type: "custom",
    render: (props) => {
      return (
        <p>
          Created at:{" "}
          <strong>
            {props.value ? new Date(props.value).toLocaleString() : ""}
          </strong>
        </p>
      );
    },
  },
  updatedAt: {
    type: "custom",
    render: ({ value }) => (
      <p>
        Updated at:{" "}
        <strong>{value ? new Date(value).toLocaleString() : ""}</strong>
      </p>
    ),
  },
  createdByName: {
    type: "custom",
    render: ({ value }) => {
      return (
        <p>
          Created by: <strong>{value}</strong>
        </p>
      );
    },
  },
  itemId: {
    type: "custom",
    render: ({ value }) => (
      <p>
        ID: <strong>{value}</strong>
      </p>
    ),
  },
};

import { useCallback, useState } from "react";
import {
  MenubarItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "../app/_components/ui/menubar";
import { samplePage, sampleTempaltes } from "./sample-page";

const createOverrideHeaderActions =
  (
    usePuck: any,
    onSave: (
      item: any,
      dispatch: (action: PuckAction) => void,
      isDraft: boolean
    ) => Promise<void>,

    previewUrl: string,
    showSaveDraft = true,
    showPreview = true,

    otherChildren: React.ReactNode | null = null
  ) =>
  () => {
    const appState = usePuck((state) => state.appState);
    const dispatch = usePuck((state) => state.dispatch);

    const [loading, setLoading] = useState(false);

    // Save the data to your database
    const save = useCallback(
      async (isDraft = false) => {
        //console.log("Save data", appState, isDraft);
        setLoading(true);
        try {
          const res = await onSave(
            { ...appState.data.root.props, content: appState.data.content },
            dispatch,
            isDraft
          );
        } catch (error) {
          //console.error("Error saving data:", error);
          toast.error("Error saving data");
        } finally {
          //console.log("Finished saving");
          setLoading(false);
        }
      },
      [appState, dispatch, onSave, setLoading]
    );
    return (
      <>
        <MenubarSub>
          <MenubarSubTrigger>Publish</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem
              disabled={loading}
              onClick={async () => {
                await save();
              }}
            >
              Publish
            </MenubarItem>
            {showSaveDraft && (
              <MenubarItem
                disabled={loading}
                onClick={async () => {
                  await save(true);
                }}
              >
                Draft
              </MenubarItem>
            )}
            {/* {showPreview && (
              <MenubarItem>
                <Link
                  href={previewUrl}
                  // Open in new tab
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview
                </Link>
              </MenubarItem>
            )} */}
          </MenubarSubContent>
        </MenubarSub>

        {otherChildren}
      </>
    );
  };

export function PageForm({ id }: { id: string }) {
  const [data] = [samplePage]; // replace with api.pages.getById.useSuspenseQuery({ id });

  const [allTemplates] = [sampleTempaltes];

  const [selectedEnvironment] = [{ frontendUrl: "http://localhost:3000" }]; // replace with api.environments.list.useSuspenseQuery();

  const [categories] = [[{ id: "cat_1", name: "Sample Category 1" }]]; // replace with api.categories.list.useSuspenseQuery();

  const { stores } = (data as any) || [];

  let selectedStoreCode = "it_it";

  if (stores && stores.length > 0) {
    selectedStoreCode = stores?.some((store: any) => store.store === "it_it")
      ? "it_it"
      : stores?.[0]?.store;
  }

  const { products, isFetching, refetch } = {
    products: [{ id: "prod_1", name: "Sample Product 1" }],
    isFetching: false,
    refetch: async () => {},
  };

  if (!data) {
    // maybe the page with this id does not exist
    // make something cool with tailwind to inform the user
    return (
      <div className="flex h-screen flex-col items-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-lg text-gray-500">
          The static page you are looking for does not exist or has been
          deleted.
        </p>
        <Link href="/dashboard">
          <_Button className="mt-4">Go back to dashboard</_Button>
        </Link>
      </div>
    );
  }

  const uniqueFonts: { name: string; fontFamily: string }[] = [];

  const resolvedConfig = useResolvedConfig(fields, allTemplates);

  const metadata = {
    products: products ?? [],
    categories: categories ?? [],
    environment: selectedEnvironment,
    fonts: uniqueFonts,
    store: {
      base_currency_code: "EUR",
      locale: "it-IT",
      code: "it_it",
    },
    refetchProducts: () => refetch(),
  };

  const { content, draftContent, ...rest } = data;

  const theData = {
    ...rest,
    content //substituteTemplatesType(content, allTemplates),
  };

  const handleSave = async (
    item: any,
    dispatch: (action: PuckAction) => void,
    isDraft: boolean
  ) => {
    const {
      createdById,
      createdByName,
      updatedAt,
      createdAt,
      itemId,
      content,
      ...rest
    } = item;

    const newPage = {
      id: itemId,
      ...rest,

      ...(isDraft
        ? {
            draftContent: content //substituteTemplatesType(content, allTemplates, false),
          }
        : {
            content, //substituteTemplatesType(content, allTemplates, false),
            draftContent: null,
          }),
    };

    // update root props
    dispatch({
      type: "replaceRoot",
      root: {
        props: {
          updatedAt: Date.now(),
        },
      },
    });
    console.log("Saved page result");
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <h2 className="pt-4">Loading page and products</h2>
        </div>
      </div>
    );
  }
  return (
    <>
      <CustomPuck
        headerTitle={`Page: `}
        metadata={metadata}
        fonts={[]}
        config={resolvedConfig}
        //headerActionsPostSlot={() => <>POSTSLOT</>}
        headerActionsPreSlot={(usePuck) =>
          createOverrideHeaderActions(
            usePuck,
            handleSave,
            `/preview/page/${theData.id}`,
            true,
            true
          )()
        }
        data={theData}
      ></CustomPuck>
    </>
  );
}
export default PageForm;
