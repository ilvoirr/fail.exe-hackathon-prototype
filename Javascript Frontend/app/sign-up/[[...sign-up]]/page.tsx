"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fce4] p-4">
      <div className="w-full max-w-sm">
        {/* Clerk Sign-Up Component - Styled to match Sign-In */}
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
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
              // Matching color variables
              colorPrimary: "#48837e",
              colorText: "#2d726a",
              colorInputBackground: "#f0fce4",
              colorNeutral: "#e7f9f3",
              colorBackground: "#ffffff",
              colorTextSecondary: "#6b7280",
              // The "IS," typo that caused the error was here
              borderRadius: "0.75rem",
            },
          }}
          path="/sign-up"
          routing="path"
        />
      </div>
    </div>
  );
}