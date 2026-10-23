import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Hook dùng chung cho các trang danh sách Admin: tự dispatch thunk khi page/pageSize/filters
// đổi, đọc items/pagination/status từ slice qua selector truyền vào. Nếu selectPagination trả
// về undefined (vd. Rooms - BE trả mảng thường không phân trang) thì Table sẽ tắt phân trang.
export function useServerTable({
  thunk,
  selectItems,
  selectPagination,
  selectStatus,
  selectError,
  errorMessage = 'Không thể tải dữ liệu.',
  initialFilters = {},
  defaultPageSize = 10,
}) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filters, setFiltersState] = useState(initialFilters);

  const items = useSelector(selectItems);
  const pagination = useSelector(selectPagination);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(thunk({ page, pageSize, ...filters }));
  }, [dispatch, thunk, page, pageSize, filters]);

  // Cùng pattern với CoursePage/ClassesPage ở public: báo lỗi qua toast khi load danh sách thất bại,
  // thay vì để bảng chỉ hiện "No data" im lặng.
  useEffect(() => {
    if (status === 'failed') {
      toast.error(error || errorMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const setFilters = useCallback((next) => {
    setFiltersState(next);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    dispatch(thunk({ page, pageSize, ...filters }));
  }, [dispatch, thunk, page, pageSize, filters]);

  const tableProps = {
    pagination: pagination
      ? {
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.totalItems,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }
      : false,
  };

  return { items, pagination, filters, loading: status === 'loading', setFilters, refresh, tableProps };
}
