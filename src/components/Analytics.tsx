import { AnalyticsCard } from "./AnalyticsCard";
import { DottedSeparator } from "./DottedSeparator";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface AnalyticsProps {
  data?: {
    taskCount: number;
    taskDifference: number;
    projectCount?: number;
    projectCountDifference?: number;
    assignedTaskCount: number;
    assignedTaskDifference: number;
    incompleteTaskCount?: number;
    incompleteTaskDifference?: number;
    completedTaskCount: number;
    completedTaskDifference: number;
    overdueTaskCount: number;
    overdueTaskDifference: number;
  };
}

export const Analytics = ({ data }: AnalyticsProps) => {
  if (!data) return null;

  return (
    <ScrollArea className="w-full shrink-0 rounded-lg border whitespace-nowrap">
      <div className="flex w-full flex-row">
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Total tasks"
            value={data.taskCount}
            variant={data.taskDifference >= 0 ? "up" : "down"}
            increaseValue={data.taskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Assigned tasks"
            value={data.assignedTaskCount}
            variant={data.assignedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Completed tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.completedTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Overdue tasks"
            value={data.overdueTaskCount}
            variant={data.overdueTaskDifference > 0 ? "up" : "down"}
            increaseValue={data.overdueTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex flex-1 items-center">
          <AnalyticsCard
            title="Incomplete tasks"
            value={data.incompleteTaskCount ?? 0}
            variant={(data.incompleteTaskDifference ?? 0) > 0 ? "up" : "down"}
            increaseValue={data.incompleteTaskDifference ?? 0}
          />
          <DottedSeparator direction="vertical" />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
