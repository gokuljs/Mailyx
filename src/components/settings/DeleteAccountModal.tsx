"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountEmail: string;
  onDeleteSuccess: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  accountId,
  accountEmail,
  onDeleteSuccess,
}: DeleteAccountModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { mutate, isPending } = api.account.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted successfully");
      onDeleteSuccess();
      onClose();
    },
    onError: (error) => {
      const errorMessage = error.message || "Unknown error occurred";
      toast.error(`Failed to delete account: ${errorMessage}`);
    },
  });

  const handleDelete = () => {
    mutate({ accountId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this account? This action cannot be
            undone and will permanently remove all data associated with{" "}
            <span className="font-semibold">{accountEmail}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-muted-foreground text-sm">
            This will delete all emails, threads, and settings associated with
            this account. You will need to reconnect the account if you want to
            use it again.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="confirm-delete"
              className="h-4 w-4"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <label htmlFor="confirm-delete" className="text-sm">
              I understand that this action cannot be undone
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
