"use client";

import { useState } from "react";
import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";

interface Plan {
  id: string; // Paddle Price ID (e.g., pri_...)
  name: string;
  description: string;
}

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePlanModal({
  isOpen,
  onClose,
}: ChangePlanModalProps) {
  const { data: currentPlanId, isLoading: isLoadingPlans } =
    api.subscription.getSubscriptionPlans.useQuery(); // Fetch plans
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { mutate: changePlan, isPending: isChangingPlan } =
    api.subscription.changePlan.useMutation();

  const handleConfirm = async () => {
    if (!selectedPlanId) {
      toast.warning("Please select a plan to switch to.");
      return;
    }
    // Use the extracted ID for comparison
    if (selectedPlanId === currentPlanId) {
      toast.info("You are already on this plan.");
      return;
    }
    try {
      await changePlan({ newPriceId: selectedPlanId });
    } catch (error) {
      console.error(error);
    }
  };

  const availablePlans = [
    {
      id: process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID,
      name: "Pro Monthly",
      description: "$20/month",
    },
    {
      id: process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID,
      name: "Pro Yearly",
      description: "$250/year (Save 17%)",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Subscription Plan</DialogTitle>
          <DialogDescription>
            Select the plan you want to switch to. Changes will take effect at
            the start of your next billing cycle.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {isLoadingPlans ? (
            <div className="flex items-center justify-center">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : (
            <RadioGroup
              value={selectedPlanId ?? undefined}
              onValueChange={setSelectedPlanId}
              className="space-y-2"
              disabled={isChangingPlan}
            >
              {availablePlans
                ?.filter((plan): plan is Plan & { id: string } => !!plan.id) // Ensure plan.id is a string
                .map((plan) => (
                  <Label
                    key={plan.id}
                    htmlFor={plan.id}
                    className={`hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center space-x-4 rounded-md border p-4 transition-colors ${
                      selectedPlanId === plan.id
                        ? "border-primary bg-muted border-2"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <div className="flex flex-col">
                      <span className="font-semibold">{plan.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {plan.description}
                      </span>
                    </div>
                  </Label>
                ))}
            </RadioGroup>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isChangingPlan}>
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            onClick={handleConfirm}
            disabled={
              isLoadingPlans || // Disable button while loading initial data
              !selectedPlanId ||
              isChangingPlan
            }
          >
            {isChangingPlan ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
