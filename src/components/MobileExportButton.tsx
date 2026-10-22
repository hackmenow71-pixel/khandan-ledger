"use client";

import { useState } from 'react';

export function MobileExportButton({ url, fileName }: { url: string, fileName: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        // Native App Export
        const { Directory, Filesystem } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');

        // Fetch the file as a blob
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          
          try {
            // Save it to the device cache
            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64data,
              directory: Directory.Cache,
            });

            // Share the file so the user can save it or send it
            await Share.share({
              title: fileName,
              url: result.uri,
            });
          } catch (e) {
            console.error('File system error:', e);
            alert("Error saving file: " + String(e));
          }
        };
      } else {
        // Normal Browser Web Export
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      alert("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport} 
      disabled={loading}
      className="inline-flex items-center justify-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 no-print transition disabled:opacity-50"
    >
      {loading ? "Exporting..." : "Export Excel"}
    </button>
  );
}
