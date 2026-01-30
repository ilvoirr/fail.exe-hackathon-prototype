"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fce4] p-4">
      {/* FIX: Added "flex flex-col items-center" 
        This centers the children and stacks them vertically.
      */}
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* FIX: Added "w-full"
          This forces the demo card to take the full width of the 
          container, matching the SignIn component.
        */}
        <div className="w-full bg-white border border-[#48837e] rounded-lg p-4 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-[#48837e] mb-3 text-center">
            Demo Credentials
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between items-center bg-[#f9fafb] px-3 py-2 rounded-md">
              <span className="text-gray-600 font-medium">Username</span>
              <span className="font-mono text-gray-900">test</span>
            </div>
            <div className="flex justify-between items-center bg-[#f9fafb] px-3 py-2 rounded-md">
              <span className="text-gray-600 font-medium">Password</span>
              <span className="font-mono text-gray-900">test123</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Use these to quickly sign in
          </p>
        </div>

        {/* Clerk Sign-In (rootBox is already w-full, so it will also obey) */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full", // This was already correct
              card: "bg-white/95 border border-[#48837e] rounded-lg shadow-lg backdrop-blur-sm",
              headerTitle: "text-[#48837e] font-bold text-xl",
              formFieldLabel: "text-gray-700",
              formButtonPrimary:
                "bg-[#48837e] text-white font-semibold rounded-lg shadow-md hover:bg-[#2d726a] transition-colors",
              footerActionText: "text-gray-500",
              footerActionLink: "text-[#48837e]/90 hover:text-[#48837e]",
              formFieldInput:
                "bg-[#f0fce4] border-gray-300 text-gray-900 focus:ring-[#48837e]/50 focus:border-[#48837e]",
              socialButtonsBlockButton:
                "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
            },
            variables: {
              colorPrimary: "#48837e",
              colorText: "#2d726a",
              colorInputBackground: "#f0fce4",
              colorNeutral: "#e7f9f3",
              colorBackground: "#ffffff",
  
              colorTextSecondary: "#6b7280",
              borderRadius: "0.75rem",
            },
          }}
          path="/sign-in"
          routing="path"
        />
      </div>
    </div>
  );
}