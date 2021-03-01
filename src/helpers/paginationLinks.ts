interface PageLinks {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}
export default (
  page: number,
  pages_total: number,
  resource_url: string
): PageLinks => {
  const url = `${resource_url}?page=`;
  const links: PageLinks = {};

  if (page < pages_total) {
    links.last = url + pages_total;
    links.next = url + (page + 1);
  }

  if (page > 1) {
    links.first = `${url}1`;
    links.prev = url + (page - 1);
  }

  return links;
};
