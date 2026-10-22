import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { addPerson } from "@/app/actions";
import { PersonList } from "@/components/PersonList";
import { AutoTranslateInputs } from "@/components/AutoTranslateInputs";
import { getUserRole } from "@/lib/auth";

export default async function PersonsPage() {
  const t = await getTranslations("Persons");
  const role = await getUserRole();
  const isAdmin = role === "ADMIN";

  const personsData = await prisma.person.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: {
      transactions: true,
      _count: {
        select: { transactions: true }
      }
    }
  });

  const persons = personsData.map(person => {
    let balance = 0;
    person.transactions.forEach(tr => {
      if (tr.type === "CREDIT") balance += tr.amount;
      if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") balance -= tr.amount;
    });
    return { ...person, balance };
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      </div>

      {isAdmin && (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">{t("addPerson")}</h3>
          <form action={addPerson as any} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end w-full">
              <AutoTranslateInputs 
                enLabel={t("nameEn")} 
                urLabel={t("nameUr")} 
                enName="nameEnglish" 
                urName="nameUrdu" 
              />
              <div className="w-full sm:w-1/4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input type="tel" name="phone" placeholder="Phone..." className="mt-1 block w-full shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 rounded-md p-2 border text-black font-sans" />
              </div>
              <div className="w-full sm:w-1/4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <input type="text" name="address" placeholder="Address..." className="mt-1 block w-full shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 rounded-md p-2 border text-black font-sans" />
              </div>
              <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                {t("addPerson")}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      <PersonList persons={persons} tEdit={t("edit") || "Edit"} isAdmin={isAdmin} />
    </div>
  );
}
