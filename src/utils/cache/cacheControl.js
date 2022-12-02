const cacheControl = function cacheControl(maxAge, opts = {}) {
  const {
    sMaxAge,
    staleIfError = 300,
    staleWhileRevalidate = 5,
  } = opts;

  const directives = [
    `max-age=${maxAge}`,
    sMaxAge && `s-maxage=${sMaxAge}`,
    staleIfError && `stale-if-error=${staleIfError}`,
    staleWhileRevalidate && `stale-while-revalidate=${staleWhileRevalidate}`,
  ];

  return directives.filter(Boolean).join(',');
};

export default cacheControl;
