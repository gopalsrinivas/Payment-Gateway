const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const page = pagination.page || pagination.currentPage || 1;
  const totalPages = pagination.totalPages || 1;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2);

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button className="rounded-md border px-3 py-2 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      {pages.map((item) => (
        <button
          key={item}
          className={`rounded-md border px-3 py-2 text-sm ${item === page ? "border-brand bg-brand text-white" : "bg-white text-slate-700"}`}
          onClick={() => onPageChange(item)}
          aria-current={item === page ? "page" : undefined}
        >
          {item}
        </button>
      ))}
      <button className="rounded-md border px-3 py-2 text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
};

export default Pagination;
