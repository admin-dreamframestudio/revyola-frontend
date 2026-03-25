import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
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
      }}
    >
      <html lang="en">
        <body className="min-h-screen bg-[#06101d] text-white antialiased selection:bg-cyan-300/20">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}