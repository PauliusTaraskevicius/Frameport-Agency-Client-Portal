import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import { TaskStatus } from "../types";

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const [initialStatus, setInitialStatus] = useQueryState(
    "create-task-status",
    parseAsStringEnum<TaskStatus>(Object.values(TaskStatus))
      .withDefault(TaskStatus.TODO)
      .withOptions({ clearOnDefault: true }),
  );

  const open = (status?: TaskStatus) => {
    setInitialStatus(status ?? TaskStatus.TODO);
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
    setInitialStatus(null);
  };

  return { isOpen, open, close, setIsOpen, initialStatus };
};
