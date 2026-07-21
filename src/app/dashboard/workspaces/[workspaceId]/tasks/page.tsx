import { TasksViewSwitcher } from "@/modules/tasks/components/TasksViewSwitcher";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const TasksPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex  h-full flex-col">
      <TasksViewSwitcher />
    </div>
  );
};

export default TasksPage;
