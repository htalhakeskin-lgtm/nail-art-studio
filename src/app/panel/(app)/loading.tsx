/**
 * Panel loading state (REQ-022, 06-arayuz: skeleton only after 300 ms, so fast screens never
 * flash). Shapes follow the card lists every panel screen uses.
 */
export default function PanelLoading() {
  return (
    <div className="delayed-skeleton" aria-busy="true">
      <p className="sr-only" role="status">
        Yükleniyor…
      </p>
      <div aria-hidden="true">
        <div className="h-9 w-48 rounded-lg bg-surface-muted" />
        <div className="mt-3 h-5 w-full max-w-md rounded bg-surface-muted" />
        <ul className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <li key={index} className="h-20 rounded-xl border bg-surface" />
          ))}
        </ul>
      </div>
    </div>
  );
}
