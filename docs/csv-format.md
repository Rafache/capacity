# Capacity CSV format

Version 3 uses a semicolon-separated UTF-8 file with a BOM. The first two rows are:

```text
# capacity;version=3
month;workRate;available;paidLeave;rtt;training;other
```

It then contains exactly twelve months, from July to June. `month` uses `YYYY-MM`. Numeric values have no unit and data cells may use the simple quotes produced by the exporter. `available` is exported for readability and recalculated when importing; it is not treated as an input.

The importer accepts only this current format: the exact two header rows, twelve ordered months and numeric values. Older French version 2 exports are no longer supported. Malformed rows, unexpected months and formula-like values are rejected with one clear error in the interface.
