import { AcceptInvitation } from "@/modules/invitations/ui/components/AcceptInvitation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  return <AcceptInvitation token={token} />;
}
