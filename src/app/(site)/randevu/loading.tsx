/**
 * Booking loading state (REQ-022): live availability is computed per request, so moving between
 * steps can take a moment on a slow line. Shown only after 300 ms, in the shape of the steps.
 */
export default function BookingLoading() {
  return (
    <div className="delayed-skeleton container-page section-y" aria-busy="true">
      <p className="sr-only" role="status">
        Boş saatler yükleniyor…
      </p>
      <div aria-hidden="true" className="mx-auto max-w-3xl">
        <div className="h-10 w-64 rounded-lg bg-surface-muted" />
        <div className="mt-3 h-5 w-full max-w-md rounded bg-surface-muted" />
        <div className="mt-10 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="h-20 w-16 shrink-0 rounded-2xl bg-surface-muted" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <div key={index} className="h-12 rounded-xl bg-surface-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
