import React, { useState } from 'react';
import { Finding } from '@/types/database';

export function ManualBrowser({ findings }: { findings: Finding[] }) {
  const [activePlugin, setActivePlugin] = useState(findings.length > 0 ? findings[0].plugin_name : "");

  const activeFinding = findings.find(f => f.plugin_name === activePlugin);

  // Try to parse the raw JSON (assuming it's an array of objects)
  let tableData: any[] = [];
  if (activeFinding?.volatility_raw_json) {
    if (Array.isArray(activeFinding.volatility_raw_json)) {
      tableData = activeFinding.volatility_raw_json;
    } else {
      // If it's a single object, wrap it
      tableData = [activeFinding.volatility_raw_json];
    }
  }

  // Get dynamic headers from the first object
  const headers = tableData.length > 0 ? Object.keys(tableData[0]).filter(k => k !== '__metadata') : [];

  return (
    <div style={{ marginTop: 20 }}>
      <div className="filter-bar" style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <select
          value={activePlugin}
          onChange={(e) => setActivePlugin(e.target.value)}
          style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}
        >
          {findings.map(f => (
            <option key={f.id} value={f.plugin_name}>Plugin: {f.plugin_name}</option>
          ))}
          {findings.length === 0 && <option>No findings available</option>}
        </select>

        <div className="filter-chip" style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '9px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-raised)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {tableData.length} Rows
        </div>
      </div>

      <div className="table-wrap" style={{ border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto', background: 'var(--bg-surface)', maxHeight: '60vh' }}>
        {tableData.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 12 }}>
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)', whiteSpace: 'nowrap' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} style={{ transition: 'background 0.2s' }}>
                  {headers.map(header => (
                    <td key={header} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {String(row[header] ?? 'N/A')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            No raw JSON data available for this plugin.
          </div>
        )}
      </div>
    </div>
  );
}
