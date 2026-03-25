import "./globals.css";
import ClerkThemeProvider from "./clerk-theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#06101d] text-white antialiased selection:bg-cyan-300/20">
        <ClerkThemeProvider>{children}</ClerkThemeProvider>
      </body>
    </html>
  );
}