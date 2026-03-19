"use client";

import { useAuth, SignIn } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface Props {
  token: string;
}

export function AcceptInvitation({ token }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const hasAccepted = useRef(false);

  const { data: validation, isLoading: isValidating } = useQuery(
    trpc.invitations.validate.queryOptions({ token }),
  );

  const acceptMutation = useMutation(
    trpc.invitations.accept.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.workspaces.getMany.queryOptions());
        router.push(`/dashboard/workspaces/${data.invitation.workspaceId}`);
      },
    }),
  );

  useEffect(() => {
    if (
      isLoaded &&
      isSignedIn &&
      validation?.valid &&
      !acceptMutation.isPending &&
      !hasAccepted.current
    ) {
      hasAccepted.current = true;
      acceptMutation.mutate({ token });
    }
  }, [
    isLoaded,
    isSignedIn,
    validation?.valid,
    acceptMutation.isPending,
    token,
  ]);

  if (!isLoaded || isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!validation || !validation.valid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Invalid Invitation</h1>
        <p className="text-muted-foreground">
          This invitation is {validation?.reason ?? "not valid"}.
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Join {validation.workspaceName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in or create an account to accept this invitation.
          </p>
        </div>
        <SignIn
          fallbackRedirectUrl={`/invite/${token}`}
          signUpFallbackRedirectUrl={`/invite/${token}`}
        />
      </div>
    );
  }

  if (acceptMutation.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Joining workspace...
      </div>
    );
  }

  if (acceptMutation.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-destructive text-2xl font-bold">Error</h1>
        <p>{acceptMutation.error.message}</p>
      </div>
    );
  }

  return null;
}
