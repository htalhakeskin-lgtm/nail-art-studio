"use client";

import { CalendarClock, XCircle } from "lucide-react";
import { useActionState } from "react";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { type ManageFormState, submitCancel, submitReschedule } from "../manage-actions";

function ServerError({ state }: { state: ManageFormState }) {
  if (!state.error) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
      {state.error.message}
    </p>
  );
}

/** UC-03: confirm the new time chosen above. */
export function RescheduleForm({ token, startsAt }: { token: string; startsAt: string }) {
  const [state, action, pending] = useActionState<ManageFormState, FormData>(submitReschedule, {});
  return (
    <form action={action} className="space-y-3">
      <ServerError state={state} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="startsAt" value={startsAt} />
      <Button type="submit" size="lg" disabled={pending}>
        <CalendarClock aria-hidden="true" />
        {pending ? "Kaydediliyor…" : "Yeni saati onayla"}
      </Button>
    </form>
  );
}

/** UC-03: cancel with an optional reason. */
export function CancelForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ManageFormState, FormData>(submitCancel, {});
  return (
    <form action={action} className="space-y-4">
      <ServerError state={state} />
      <input type="hidden" name="token" value={token} />
      <FormField name="reason" label="İptal nedeni" hint="İsteğe bağlı; yalnızca stüdyo görür.">
        {(control) => <Textarea {...control} rows={3} maxLength={300} />}
      </FormField>
      <Button type="submit" size="lg" variant="destructive" disabled={pending}>
        <XCircle aria-hidden="true" />
        {pending ? "İptal ediliyor…" : "Randevuyu iptal et"}
      </Button>
    </form>
  );
}
