import { AcceptInvitation } from "@/modules/invitations/ui/components/AcceptInvitation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { token } = await params;

  return (
    <div>
      <AcceptInvitation token={token} />;
    </div>
  );
}
