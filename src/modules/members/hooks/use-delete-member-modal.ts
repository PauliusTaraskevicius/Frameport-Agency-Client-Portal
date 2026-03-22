import { useQueryState, parseAsBoolean } from "nuqs";

export const useDeleteMemberModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "delete-member",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
};
