import resolvePuckPath from "../../lib/resolve-puck-path";
import { Metadata } from "next";
import PageForm from "./custom";
// import Client from "./client";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ framework: string; uuid: string; puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath } = await params;
  const { isEdit, path } = resolvePuckPath(puckPath);

  if (isEdit) {
    return {
      title: "Editing: " + path,
    };
  }

  return {
    title: "",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ framework: string; uuid: string; puckPath: string[] }>;
}) {
  const { puckPath } = await params;

  if (puckPath.find((part) => part === "test")) {
    return <PageForm />
  }

  const { isEdit, path } = resolvePuckPath(puckPath);

  return (
    <div>
      Demo Page for path: {path} (isEdit: {isEdit ? "true" : "false"})
    </div>
  );

  // return <Client isEdit={isEdit} path={path} />;
}
