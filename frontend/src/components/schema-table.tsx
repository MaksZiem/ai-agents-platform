import { getSchemaFields } from "@/lib/tools";

type SchemaTableProps = {
  title: string;
  schema: Record<string, unknown>;
};

export function SchemaTable({ title, schema }: SchemaTableProps) {
  const fields = getSchemaFields(schema);

  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-medium text-fg-muted">{title}</h4>
      {fields.length === 0 ? (
        <p className="text-[13px] text-fg-muted">No fields.</p>
      ) : (
        <table className="w-full text-[13px]">
          <thead className="sr-only">
            <tr>
              <th>Field</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fields.map((field) => (
              <tr key={field.name}>
                <td className="py-1.5 pr-3 font-mono">
                  {field.name}
                  {!field.required && <span className="text-fg-muted">?</span>}
                </td>
                <td className="py-1.5 font-mono text-fg-muted">{field.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
