"use client";

import { useTranslations } from "next-intl";
import { uploadFile } from "@/app/actions/inventory";
import { useRef, useState } from "react";

export function UploadFileForm({ personId }: { personId?: string }) {
  const t = useTranslations("Inventory");
  const formRef = useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <form action={async (formData) => {
      setIsUploading(true);
      await uploadFile(formData);
      formRef.current?.reset();
      setIsUploading(false);
    }} ref={formRef} className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <input type="hidden" name="personId" value={personId || ""} />
      
      <div className="flex-1 w-full relative border-2 border-dashed border-gray-300 rounded-md px-6 py-4 text-center hover:bg-gray-50 cursor-pointer transition">
        <input
          type="file"
          name="file"
          required
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <span className="text-sm text-gray-500">{t("dragDrop")}</span>
      </div>
      
      <button
        type="submit"
        disabled={isUploading}
        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
      >
        {isUploading ? "..." : t("uploadFile")}
      </button>
    </form>
  );
}