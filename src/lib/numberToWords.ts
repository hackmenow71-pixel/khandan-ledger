export function numberToWordsEn(num: number): string {
  if (num === 0) return "Zero";
  if (isNaN(num)) return "";

  const integerPart = Math.floor(num);
  const fractionalPart = Math.round((num - integerPart) * 100);

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
    "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const numToWords = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + numToWords(n % 100) : "");
    if (n < 1000000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "");
    if (n < 1000000000) return numToWords(Math.floor(n / 1000000)) + " Million" + (n % 1000000 !== 0 ? " " + numToWords(n % 1000000) : "");
    return numToWords(Math.floor(n / 1000000000)) + " Billion" + (n % 1000000000 !== 0 ? " " + numToWords(n % 1000000000) : "");
  };

  let result = integerPart === 0 ? "Zero" : numToWords(integerPart);

  if (fractionalPart > 0) {
    if (integerPart > 0) {
      result += " and " + numToWords(fractionalPart) + " Paisa";
    } else {
      result = numToWords(fractionalPart) + " Paisa";
    }
  }

  return result.trim();
}

export function numberToWordsUr(num: number): string {
  if (num === 0) return "صفر";
  if (isNaN(num)) return "";

  const integerPart = Math.floor(num);
  const fractionalPart = Math.round((num - integerPart) * 100);

  const ones = ["", "ایک", "دو", "تین", "چار", "پانچ", "چھ", "سات", "آٹھ", "نو", "دس", "گیارہ", "بارہ", "تیرا", "چودہ", "پندرہ", "سولہ", "سترہ", "اٹھارہ", "انیس"];
  const tens = ["", "", "بیس", "تیس", "چالیس", "پچاس", "ساٹھ", "ستر", "اسی", "نوے"];

  const urduMapping: Record<number, string> = {
    21: "اکیس", 22: "بائیس", 23: "تیئس", 24: "چوبیس", 25: "پچیس", 26: "چھبیس", 27: "ستائیس", 28: "اٹھائیس", 29: "انتیس",
    31: "اکتیس", 32: "بتیس", 33: "تینتیس", 34: "چونتیس", 35: "پینتیس", 36: "چھتیس", 37: "سینتیس", 38: "اڑتیس", 39: "انتالیس",
    41: "اکتالیس", 42: "بیالیس", 43: "تینتالیس", 44: "چوالیس", 45: "پینتالیس", 46: "چھیالیس", 47: "سینتالیس", 48: "اڑتالیس", 49: "انچاس",
    51: "اکیاون", 52: "باون", 53: "ترپن", 54: "چون", 55: "پچپن", 56: "چھپن", 57: "ستاون", 58: "اٹھاون", 59: "انسٹھ",
    61: "اکسٹھ", 62: "باسٹھ", 63: "تریسٹھ", 64: "چوسٹھ", 65: "پینسٹھ", 66: "چھیاسٹھ", 67: "سڑسٹھ", 68: "اڑسٹھ", 69: "انہتر",
    71: "اکہتر", 72: "بہتر", 73: "تہتر", 74: "چوہتر", 75: "پچہتر", 76: "چھہتر", 77: "ستتر", 78: "اٹھتر", 79: "اناسی",
    81: "اکیاسی", 82: "بیاسی", 83: "تراسی", 84: "چوراسی", 85: "پچاسی", 86: "چھیاسی", 87: "ستاسی", 88: "اٹھاسی", 89: "نواسی",
    91: "اکانوے", 92: "بانوے", 93: "ترانوے", 94: "چورانوے", 95: "پچانوے", 96: "چھیانوے", 97: "ستانوے", 98: "اٹھانوے", 99: "ننانوے"
  };

  const numToWords = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return urduMapping[n] || (tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : ""));
    if (n < 1000) return numToWords(Math.floor(n / 100)) + " سو" + (n % 100 !== 0 ? " " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " ہزار" + (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " لاکھ" + (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " کروڑ" + (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "");
  };

  let result = integerPart === 0 ? "صفر" : numToWords(integerPart);
  
  if (fractionalPart > 0) {
    if (integerPart > 0) {
      result += " روپئے اور " + numToWords(fractionalPart) + " پیسے";
    } else {
      result = numToWords(fractionalPart) + " پیسے";
    }
  }

  return result.trim();
}
