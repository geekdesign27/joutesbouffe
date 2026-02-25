import { useState, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

function defaultGetSearchValue(item, key) {
  const val = item[key];
  return val == null ? '' : String(val);
}

export function DataTable({
  data,
  columns,
  renderCell,
  getSearchValue = defaultGetSearchValue,
  tableClassName = 'table table-zebra',
  tableSizeClass,
  emptyState,
  footer,
  searchPlaceholder = 'Rechercher...',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const searchableKeys = useMemo(
    () => columns.filter((c) => c.searchable).map((c) => c.key),
    [columns]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return data;
    const term = debouncedSearch.toLowerCase();
    return data.filter((item) =>
      searchableKeys.some((key) =>
        getSearchValue(item, key).toLowerCase().includes(term)
      )
    );
  }, [data, debouncedSearch, searchableKeys, getSearchValue]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = getSearchValue(a, sortKey);
      const bVal = getSearchValue(b, sortKey);
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      let cmp;
      if (aVal !== '' && bVal !== '' && !isNaN(aNum) && !isNaN(bNum)) {
        cmp = aNum - bNum;
      } else {
        cmp = aVal.localeCompare(bVal, 'fr-CH', { sensitivity: 'base' });
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, getSearchValue]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  if (!data.length) return emptyState || null;

  const tableClasses = [tableClassName, tableSizeClass].filter(Boolean).join(' ');

  return (
    <div>
      {searchableKeys.length > 0 && (
        <div className="mb-3">
          <input
            type="text"
            className="input input-sm w-full max-w-xs"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      {sorted.length === 0 ? (
        <p className="text-base-content/60 text-sm py-4">
          Aucun résultat pour « {debouncedSearch} »
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className={tableClasses}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={[
                      col.className || '',
                      col.sortable ? 'cursor-pointer select-none' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    {col.header}
                    {col.sortable && sortIcon(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => renderCell(item))}
            </tbody>
            {footer}
          </table>
        </div>
      )}
    </div>
  );
}
