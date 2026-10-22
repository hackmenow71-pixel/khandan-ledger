import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { InventoryList } from "@/components/InventoryList";
import { UploadFileForm } from "@/components/UploadFileForm";

export default async function InventoryPage() {
  const t = await getTranslations("Inventory");
  
  const files = await prisma.file.findMany({
    orderBy: { createdAt: 'desc' },
    include: { person: true }
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("uploadFile")}</h2>
        <UploadFileForm />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <InventoryList files={files} />
        </div>
      </div>
    </div>
  );
}
