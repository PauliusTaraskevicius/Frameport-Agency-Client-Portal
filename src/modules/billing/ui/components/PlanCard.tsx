"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: number;
  currentPlan: boolean;
  features: Record<string, boolean>;
  onSelect: () => void;
  onManage?: () => void;
}

export const PlanCard = ({
  currentPlan,
  features,
  name,
  price,
  onSelect,
  onManage,
}: PlanCardProps) => {
  const featuresList = Object.entries(features);

  return (
    <Card className={currentPlan ? "border-primary" : ""}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>${price} / month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {featuresList.map(([key, enabled]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            {enabled ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-300" />
            )}
            <span className={enabled ? "" : "text-gray-400"}>
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        {currentPlan ? (
          <Button variant="outline" className="w-full" onClick={onManage}>
            Manage Subscription
          </Button>
        ) : (
          <Button className="w-full" onClick={onSelect}>
            Upgrade
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
