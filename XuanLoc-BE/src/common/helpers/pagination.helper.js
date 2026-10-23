// Helper phân trang dùng chung cho các service getAllXByAdmin.
// Mỗi service tự xây `where` riêng (filter/keyword...), helper này chỉ lo phần page/pageSize.
export const getPagination = (query = {}) => {
  let { page, pageSize } = query;

  page = Number(page) || 1;
  pageSize = Number(pageSize) || 10;

  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};

export const buildPaginatedResult = (data, total, page, pageSize) => ({
  items: data,
  pagination: {
    page,
    pageSize,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  },
});
