# Capacity CSV format

Version 3 uses a semicolon-separated UTF-8 file with a BOM. The first two rows are:

```text
"# capacity";"version=3"
"month";"workRate";"available";"paidLeave";"rtt";"training";"other"
```

It then contains exactly twelve months, from July to June. `month` uses `YYYY-MM`.
All numeric values are plain numbers, without a unit. `available` is exported for
readability and is recalculated when importing; it is not treated as an input.

The importer accepts the French version 2 exports created by earlier app versions.
The former free-text `Note` column is ignored on import and is no longer exported.
CSV files are limited to 1 MB and malformed files, unknown or duplicate columns,
missing months, and formula-like numeric values are rejected.

The file uses RFC 4180-style escaping: fields are quoted and embedded double quotes
are doubled.
