"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SharePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // Automatically log in as the viewer (Rehman)
    const autoLogin = async () => {
      try {
        const res = await signIn("credentials", {
          redirect: false,
          username: "Rehman",
          password: "Z26071980"
        });

        if (res?.error) {
          setError("Failed to generate viewer access. Please check server logs.");
        } else {
          // Success! Redirect to dashboard.
          router.push("/");
          router.refresh();
        }
      } catch (err) {
        setError("An error occurred during authentication.");
      }
    };

    autoLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900">Preparing secure access...</h2>
          <p className="mt-2 text-sm text-gray-600">Logging you in as a Viewer. Please wait.</p>
          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}