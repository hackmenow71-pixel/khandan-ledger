import { NextResponse } from 'next/server';
import dictionary from '@/lib/dictionary.json';

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const sl = sourceLang || 'en';
    const tl = targetLang || 'ur';

    // 1. FAST LOCAL DICTIONARY LOOKUP
    if (sl === 'en' && tl === 'ur') {
      const lowerText = text.trim().toLowerCase();
      const rawDict = dictionary as Record<string, string>;
      
      const localDict: Record<string, string> = {};
      for (const [key, val] of Object.entries(rawDict)) {
        localDict[key.toLowerCase()] = val;
      }
      
      if (localDict[lowerText]) {
        return NextResponse.json({ translatedText: localDict[lowerText], source: 'dictionary' });
      }
    }

    // 2. GOOGLE TRANSLATE API (Instant, High Accuracy)
    try {
      const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
      const googleRes = await fetch(googleUrl);
      if (googleRes.ok) {
        const googleData = await googleRes.json();
        if (googleData && googleData[0] && googleData[0][0] && googleData[0][0][0]) {
          return NextResponse.json({ 
            translatedText: googleData[0][0][0], 
            source: 'google-translate' 
          });
        }
      }
    } catch (gErr) {
      console.warn("Google Translate API attempt failed, using fallback:", gErr);
    }

    // 3. Fallback to MyMemory Translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
    const response = await fetch(url);
    const data = await response.json();
    const translatedText = data?.responseData?.translatedText || null;

    if (!translatedText) {
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }

    return NextResponse.json({ translatedText, source: 'mymemory' });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
