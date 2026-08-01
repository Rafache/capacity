import { ArrowUpDown } from "lucide-react";
import { useRef, type ChangeEvent } from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onClear: () => void;
};

export function CsvMenu({ open, onToggle, onImport, onExport, onClear }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  return <div className="csv-wrap">
    <button className="csv-button" onClick={onToggle} aria-expanded={open}><ArrowUpDown aria-hidden="true" /> <span>Import / export</span></button>
    {open && <div className="csv-menu"><button onClick={() => fileRef.current?.click()}>Importer un CSV</button><button onClick={onExport}>Exporter en CSV</button><button className="danger-action" onClick={onClear}>Effacer mes données</button></div>}
    <input ref={fileRef} className="hidden-input" type="file" accept=".csv,text/csv" onChange={onImport} />
  </div>;
}
