import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return <div>HOMEPAGE</div>;
}
