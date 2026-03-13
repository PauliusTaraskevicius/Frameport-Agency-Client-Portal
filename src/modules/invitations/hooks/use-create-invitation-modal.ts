import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateInvitationModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-invitation",
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
