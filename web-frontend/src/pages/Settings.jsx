import React, { useEffect, useState } from 'react';
import './Settings.css';

const STORAGE_KEY = 'attendance_settings_v1';

const defaultData = {
  shifts: [
    // example
    // { id: 's1', name: 'Morning', startTime: '08:00', endTime: '17:00', toleranceMins: 10 }
  ],
  timeRules: [
    // example
    // { id: 't1', name: 'LateThreshold', valueMins: 15 }
  ]
};

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2,9)}`;
}

export default function SettingsPage() {
  const [data, setData] = useState(defaultData);
  const [shiftForm, setShiftForm] = useState({ id: '', name: '', startTime: '08:00', endTime: '17:00', toleranceMins: 0 });
  const [editingShiftId, setEditingShiftId] = useState(null);
  const [ruleForm, setRuleForm] = useState({ id: '', name: '', valueMins: 15 });
  const [editingRuleId, setEditingRuleId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (e) {
      console.error('load settings', e);
    }
  }, []);

  function persist(next) {
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) { console.error('save settings', e); }
  }

  // Shifts handlers
  function handleShiftSubmit(e) {
    e.preventDefault();
    const { id, name, startTime, endTime, toleranceMins } = shiftForm;
    if (!name.trim()) return alert('Please enter shift name');
    const trimmed = name.trim();
    if (editingShiftId) {
      const next = { ...data, shifts: data.shifts.map(s => s.id === editingShiftId ? { ...s, name: trimmed, startTime, endTime, toleranceMins: Number(toleranceMins) } : s) };
      persist(next);
      setEditingShiftId(null);
      setShiftForm({ id: '', name: '', startTime: '08:00', endTime: '17:00', toleranceMins: 0 });
    } else {
      const newShift = { id: uid('s'), name: trimmed, startTime, endTime, toleranceMins: Number(toleranceMins) };
      const next = { ...data, shifts: [newShift, ...data.shifts] };
      persist(next);
      setShiftForm({ id: '', name: '', startTime: '08:00', endTime: '17:00', toleranceMins: 0 });
    }
  }

  function handleEditShift(id) {
    const s = data.shifts.find(x => x.id === id);
    if (!s) return;
    setEditingShiftId(id);
    setShiftForm({ id: s.id, name: s.name, startTime: s.startTime, endTime: s.endTime, toleranceMins: s.toleranceMins });
  }

  function handleDeleteShift(id) {
    if (!confirm('Delete this shift?')) return;
    const next = { ...data, shifts: data.shifts.filter(s => s.id !== id) };
    persist(next);
  }

  // Time rules handlers
  function handleRuleSubmit(e) {
    e.preventDefault();
    const { id, name, valueMins } = ruleForm;
    if (!name.trim()) return alert('Please enter rule name');
    const trimmed = name.trim();
    if (editingRuleId) {
      const next = { ...data, timeRules: data.timeRules.map(r => r.id === editingRuleId ? { ...r, name: trimmed, valueMins: Number(valueMins) } : r) };
      persist(next);
      setEditingRuleId(null);
      setRuleForm({ id: '', name: '', valueMins: 15 });
    } else {
      const newRule = { id: uid('r'), name: trimmed, valueMins: Number(valueMins) };
      const next = { ...data, timeRules: [newRule, ...data.timeRules] };
      persist(next);
      setRuleForm({ id: '', name: '', valueMins: 15 });
    }
  }

  function handleEditRule(id) {
    const r = data.timeRules.find(x => x.id === id);
    if (!r) return;
    setEditingRuleId(id);
    setRuleForm({ id: r.id, name: r.name, valueMins: r.valueMins });
  }

  function handleDeleteRule(id) {
    if (!confirm('Delete this rule?')) return;
    const next = { ...data, timeRules: data.timeRules.filter(r => r.id !== id) };
    persist(next);
  }

  function handleResetDefaults() {
    if (!confirm('Reset settings to defaults?')) return;
    persist(defaultData);
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2 className="settings-title">Settings — Shifts & Time Rules</h2>

        <section className="panel">
          <h3>Shifts</h3>
          <form className="form-row" onSubmit={handleShiftSubmit}>
            <input placeholder="Shift name" value={shiftForm.name} onChange={e => setShiftForm(f => ({ ...f, name: e.target.value }))} />
            <label>Start <input type="time" value={shiftForm.startTime} onChange={e => setShiftForm(f => ({ ...f, startTime: e.target.value }))} /></label>
            <label>End <input type="time" value={shiftForm.endTime} onChange={e => setShiftForm(f => ({ ...f, endTime: e.target.value }))} /></label>
            <label>Tolerance (mins) <input type="number" min="0" value={shiftForm.toleranceMins} onChange={e => setShiftForm(f => ({ ...f, toleranceMins: e.target.value }))} /></label>
            <div className="form-actions">
              <button type="submit" className="btn primary">{editingShiftId ? 'Save' : 'Add Shift'}</button>
              {editingShiftId && <button type="button" className="btn" onClick={() => { setEditingShiftId(null); setShiftForm({ id: '', name: '', startTime: '08:00', endTime: '17:00', toleranceMins: 0 }); }}>Cancel</button>}
            </div>
          </form>

          <div className="list">
            {data.shifts.length === 0 ? <div className="empty">No shifts defined.</div> : (
              <table className="list-table">
                <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Tolerance</th><th></th></tr></thead>
                <tbody>
                  {data.shifts.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.startTime}</td>
                      <td>{s.endTime}</td>
                      <td>{s.toleranceMins} min</td>
                      <td className="actions">
                        <button className="btn small" onClick={() => handleEditShift(s.id)}>Edit</button>
                        <button className="btn small danger" onClick={() => handleDeleteShift(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="panel">
          <h3>Time Rules</h3>
          <form className="form-row" onSubmit={handleRuleSubmit}>
            <input placeholder="Rule name (e.g. LateThreshold)" value={ruleForm.name} onChange={e => setRuleForm(f => ({ ...f, name: e.target.value }))} />
            <label>Value (mins) <input type="number" min="0" value={ruleForm.valueMins} onChange={e => setRuleForm(f => ({ ...f, valueMins: e.target.value }))} /></label>
            <div className="form-actions">
              <button type="submit" className="btn primary">{editingRuleId ? 'Save' : 'Add Rule'}</button>
              {editingRuleId && <button type="button" className="btn" onClick={() => { setEditingRuleId(null); setRuleForm({ id: '', name: '', valueMins: 15 }); }}>Cancel</button>}
            </div>
          </form>

          <div className="list">
            {data.timeRules.length === 0 ? <div className="empty">No time rules defined.</div> : (
              <table className="list-table">
                <thead><tr><th>Name</th><th>Value (mins)</th><th></th></tr></thead>
                <tbody>
                  {data.timeRules.map(r => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.valueMins} min</td>
                      <td className="actions">
                        <button className="btn small" onClick={() => handleEditRule(r.id)}>Edit</button>
                        <button className="btn small danger" onClick={() => handleDeleteRule(r.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <div className="footer-actions">
          <button className="btn" onClick={() => { try { localStorage.removeItem(STORAGE_KEY); setData(defaultData); } catch (e) {} }}>Clear All</button>
          <button className="btn" onClick={handleResetDefaults}>Reset Defaults</button>
        </div>
      </div>
    </div>
  );
}
