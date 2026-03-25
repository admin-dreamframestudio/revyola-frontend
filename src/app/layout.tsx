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
          colorBackground: "#06101d",
          colorText: "#ffffff",
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