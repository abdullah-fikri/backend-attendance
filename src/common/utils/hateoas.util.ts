export const hateoas = (baseUrl: string, page: number, limit: number, totalPages: number) => {
    const makeUrl = (p: number) => `${baseUrl}?page=${p}&limit=${limit}`;
  
    return {
      self: makeUrl(page),
      next: page < totalPages ? makeUrl(page + 1) : null,
      prev: page > 1 ? makeUrl(page - 1) : null,
      first: makeUrl(1),
      last: makeUrl(totalPages),
    };
  };
  