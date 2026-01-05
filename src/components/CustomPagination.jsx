// eslint-disable-next-line react/prop-types
export default function CustomPagination({ totalPage, currentPage, setPage }) {
  return (
    <div className="flex gap-2 items-center mt-4">
      Page
      <input
        type="number"
        className="border rounded-full px-4 py-1 outline-none w-[100px]"
        defaultValue={currentPage}
        onChange={(e) => setPage(e.target.value)}
      />
      of
      {totalPage}
    </div>
  );
}
