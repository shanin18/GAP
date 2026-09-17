import config from "@payload-config";
import "@payloadcms/next/css";
import "./admin-theme.css";
import { fraunces, manrope } from "@/lib/fonts";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import { importMap } from "./admin/importMap";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function PayloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout
      config={config}
      htmlProps={{ className: `gap-admin ${fraunces.variable} ${manrope.variable}` }}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
