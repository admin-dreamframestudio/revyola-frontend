import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#06101d] flex items-center justify-center p-6">
      <SignUp />
    </main>
  );
}