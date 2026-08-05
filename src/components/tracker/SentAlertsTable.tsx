import { useSentBroadcasts } from "@/lib/tracker-queries";
import { AttachmentPreview } from "@/components/tracker/MediaComposer";

export function SentAlertsTable() {
  const { data: broadcasts = [], isLoading } = useSentBroadcasts();

  if (isLoading) {
    return <div className="mt-6 text-sm text-muted-foreground">Loading sent alerts…</div>;
  }

  if (broadcasts.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed bg-card/40 py-10 text-center text-sm text-muted-foreground">
        No alerts sent yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-5 py-3 text-left font-medium">Target</th>
            <th className="px-5 py-3 text-left font-medium">Message</th>
            <th className="px-5 py-3 text-left font-medium">Recipients</th>
            <th className="px-5 py-3 text-left font-medium">Sent</th>
          </tr>
        </thead>
        <tbody>
          {broadcasts.map((b) => (
            <tr key={b.id} className="border-b last:border-0 align-top transition hover:bg-muted/30">
              <td className="px-5 py-3 text-xs">
                {b.targetType === "employee" ? (
                  <span className="font-mono">{b.targetEmployeeCode}</span>
                ) : b.targetType === "all" ? (
                  <span className="font-medium">All employees</span>
                ) : (
                  <span className="font-medium">Department</span>
                )}
              </td>
              <td className="max-w-sm px-5 py-3">
                <p className="line-clamp-2 text-foreground">{b.message}</p>
                {b.attachment && (
                  <div className="mt-1">
                    <AttachmentPreview a={b.attachment} />
                  </div>
                )}
              </td>
              <td className="px-5 py-3 text-muted-foreground">{b.recipientCount}</td>
              <td className="px-5 py-3 text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
