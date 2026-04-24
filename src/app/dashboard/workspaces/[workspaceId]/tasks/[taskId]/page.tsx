import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClientTaskIdPage } from "@/modules/tasks/components/ClientTaskIdPage";

interface TaskIdPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

const TaskIdPage = async ({ params }: TaskIdPageProps) => {
  const { userId } = await auth();

  const { taskId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }
  return <ClientTaskIdPage params={{ taskId }} />;
};

export default TaskIdPage;
