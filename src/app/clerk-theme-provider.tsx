"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const appAppearance = {
  variables: {
    colorPrimary: "#67e8f9",
    colorBackground: "#0b1728",
    colorInputBackground: "#111c2d",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#cbd5e1",
    colorNeutral: "#1e293b",
    colorDanger: "#f87171",
    borderRadius: "16px",
  },
  elements: {
    card: "bg-[#0b1728] border border-white/10 shadow-2xl rounded-[24px]",
    rootBox: "w-full",
    headerTitle: "text-white text-2xl font-semibold",
    headerSubtitle: "text-slate-300",
    socialButtonsBlockButton:
      "bg-white text-slate-950 border border-white/20 hover:bg-slate-100 rounded-2xl shadow-none",
    socialButtonsBlockButtonText: "text-slate-950 font-medium",
    dividerLine: "bg-white/10",
    dividerText: "text-slate-400",
    formFieldLabel: "text-slate-200",
    formFieldInput:
      "bg-[#111c2d] text-white border border-white/10 rounded-2xl placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-0",
    formButtonPrimary:
      "bg-cyan-300 text-slate-950 hover:bg-cyan-200 rounded-2xl font-medium shadow-none",
    footerActionText: "text-slate-400",
    footerActionLink: "text-cyan-300 hover:text-cyan-200",
    identityPreviewText: "text-slate-300",
    formResendCodeLink: "text-cyan-300 hover:text-cyan-200",
    otpCodeFieldInput:
      "bg-[#111c2d] text-white border border-white/10 rounded-2xl",
    alertText: "text-slate-200",
    alert: "bg-white/[0.04] border border-white/10 text-slate-200",
  },
};

const authAppearance = {
  variables: {
    colorPrimary: "#06b6d4",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorText: "#0f172a",
    colorTextSecondary: "#475569",
    colorNeutral: "#e2e8f0",
    colorDanger: "#dc2626",
    borderRadius: "16px",
  },
elements: {
  card: "bg-white border border-slate-200 shadow-2xl rounded-[24px]",
  rootBox: "w-full",
  headerTitle: "text-slate-900 text-2xl font-semibold",
  headerSubtitle: "text-slate-600",

  socialButtonsBlockButton:
  "!bg-white !text-slate-900 !border !border-slate-300 hover:!bg-slate-50 rounded-2xl shadow-none",
  socialButtonsBlockButtonText: "!text-slate-900 font-medium",

  dividerLine: "bg-slate-200",
  dividerText: "text-slate-500",

  formFieldLabel: "text-slate-800 font-medium",
  formFieldInput:
  "!bg-white !text-slate-900 !border !border-slate-400 rounded-2xl placeholder:!text-slate-400 focus:!border-cyan-500 focus:ring-0",

  formFieldRow: "gap-2",
  formField: "space-y-2",
  formFieldInputShowPasswordButton: "text-slate-500 hover:text-slate-700",

  formButtonPrimary:
    "bg-cyan-500 text-white hover:bg-cyan-600 rounded-2xl font-medium shadow-none",
  formButtonPrimaryText: "text-white",

 //footerActionText: "text-slate-600",
 //footerActionLink: "text-cyan-600 hover:text-cyan-500 font-medium",
 footerAction: "hidden",
 footerActionText: "hidden",
 footerActionLink: "hidden",
  identityPreviewText: "text-slate-700",
  formResendCodeLink: "text-cyan-600 hover:text-cyan-500",
  otpCodeFieldInput:
    "bg-white text-slate-900 border border-slate-300 rounded-2xl",

  alertText: "text-slate-700",
  alert: "bg-slate-50 border border-slate-200 text-slate-700",

  formFieldHintText: "text-slate-500",
  formFieldErrorText: "text-red-600",
  alternativeMethodsBlockButton:
    "text-slate-700 border border-slate-300 bg-white hover:bg-slate-50",
  alternativeMethodsBlockButtonText: "text-slate-700",
},
};

export default function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  //const isAuthPage =
    //pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
    const isAuthPage = pathname?.startsWith("/sign-in");

  return (
    <ClerkProvider appearance={isAuthPage ? authAppearance : appAppearance}>
      {children}
    </ClerkProvider>
  );
}