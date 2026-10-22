import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";

export default async function ReceiptPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;
  
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { person: true }
  });

  if (!transaction) notFound();

  const d = transaction.date ? new Date(transaction.date) : new Date(transaction.createdAt);
  const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  
  let typeLabelEn = "";
  let typeLabelUr = "";
  
  if (transaction.type === "CREDIT") { typeLabelEn = "Credit (Payment Received)"; typeLabelUr = "جمع شدہ رقم (وصول شدہ)"; }
  else if (transaction.type === "DEBIT") { typeLabelEn = "Debit (Loan/Item Given)"; typeLabelUr = "قرض / سامان دیا گیا"; }
  else if (transaction.type === "DEBIT_PROFIT") { typeLabelEn = "Profit Paid"; typeLabelUr = "منافع دیا گیا"; }
  else if (transaction.type === "TO_BE_GIVEN") { typeLabelEn = "To Be Given"; typeLabelUr = "دینے والی رقم"; }
  else if (transaction.type === "TO_BE_TAKEN") { typeLabelEn = "To Be Taken"; typeLabelUr = "لینے والی رقم"; }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-8 no-print border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Receipt</h1>
        <div className="flex gap-4">
          <a href={`/persons/${transaction.personId}`} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            Back to Account
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="receipt-content text-gray-900 dark:text-gray-100">
        <div className="text-center mb-8 border-b-2 border-gray-800 dark:border-gray-300 pb-6">
          <h1 className="text-4xl font-black uppercase tracking-widest text-black dark:text-white mb-2">Receipt</h1>
          <p className="text-lg font-urdu text-gray-600 dark:text-gray-400">رسید</p>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Receipt No.</p>
            <p className="font-mono">{transaction.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Date / تاریخ</p>
            <p className="font-semibold">{formattedDate}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8 border border-gray-100 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Account Name</p>
              <p className="text-xl font-bold">{transaction.person.nameEnglish}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1 font-urdu">اکاؤنٹ کا نام</p>
              <p className="text-xl font-urdu">{transaction.person.nameUrdu}</p>
            </div>

            <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Transaction Type / قسم</p>
              <p className="text-lg font-semibold flex justify-between">
                <span>{typeLabelEn}</span>
                <span className="font-urdu text-gray-600 dark:text-gray-300">{typeLabelUr}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">Description / تفصیل</p>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-4 rounded-lg flex justify-between items-start min-h-[80px]">
            <p className="w-1/2 pr-4">{transaction.descriptionEnglish}</p>
            <p className="w-1/2 pl-4 text-right font-urdu text-gray-700 dark:text-gray-300 border-l border-gray-200 dark:border-gray-600">{transaction.descriptionUrdu}</p>
          </div>
        </div>

        <div className="flex justify-between items-end border-t-2 border-gray-800 dark:border-gray-300 pt-6 mt-12">
          <div className="w-1/3 border-t border-gray-400 dark:border-gray-500 pt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Authorized Signature<br/>دستخط
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount / رقم</p>
            <p className="text-4xl font-black text-black dark:text-white">
              {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
