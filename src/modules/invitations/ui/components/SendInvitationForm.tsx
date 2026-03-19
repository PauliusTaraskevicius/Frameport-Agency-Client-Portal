"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvitationSchema } from "../../schema";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DottedSeparator } from "@/components/DottedSeparator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateInvitationModal } from "../../hooks/use-create-invitation-modal";

interface SendInvitationFormProps {
  onCancel?: () => void;
}

export const SendInvitationForm = ({ onCancel }: SendInvitationFormProps) => {
  const trpc = useTRPC();
  const params = useParams();
  const { close } = useCreateInvitationModal();
  const workspaceId = params.workspaceId as string;

  const form = useForm<z.infer<typeof createInvitationSchema>>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      workspaceId,
      email: "",
    },
  });

  const sendInvitation = useMutation(
    trpc.invitations.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        toast.success("Invitation sent successfully");

        close();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send invitation");
      },
    }),
  );

  const isPending = sendInvitation.isPending;

  const onSubmit = async (values: z.infer<typeof createInvitationSchema>) => {
    await sendInvitation.mutateAsync(values);
  };

  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Invite Client</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter client email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DottedSeparator />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
