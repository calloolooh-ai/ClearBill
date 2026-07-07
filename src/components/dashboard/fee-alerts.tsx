import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { FeeAlert } from "@/types/alerts";

const KIND_LABEL: Record<FeeAlert["kind"], string> = {
  "late-fee": "Late Fee",
  "admin-fee": "Administrative Fee",
  "duplicate-charge": "Possible Duplicate",
  "unexpected-increase": "Unexpected Increase",
};

export function FeeAlerts({ alerts }: { alerts: FeeAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.severity === "high" ? "destructive" : "default"} className="rounded-2xl">
          <AlertTriangle className="size-4" />
          <AlertTitle>{KIND_LABEL[alert.kind]}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
