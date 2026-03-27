import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

const UOM_OPTIONS = ["ML", "L", "GM", "KG", "NOS", "PCS"];

const emptyRow = () => ({
  itemName: "",
  uom: "KG",
  issueQty: "",
  usedQty: "",
  wastageQty: "",
  remainingQty: "",
});

export default function StockUpdate() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [rows, setRows] = useState([emptyRow()]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadingBrands(true);
      setError("");
      try {
        const res = await api.get("/api/admin/brands");
        const list = Array.isArray(res.data) ? res.data : [];
        const filtered = list
          .filter((b) => b?.brandName)
          .map((b) => ({ _id: b._id, brandName: b.brandName }))
          .sort((a, b) => a.brandName.localeCompare(b.brandName));
        setBrands(filtered);
        if (!brandId && filtered.length) setBrandId(filtered[0]._id);
      } catch (err) {
        setBrands([]);
        setError(err.response?.data?.message || "Failed to load brands");
      } finally {
        setLoadingBrands(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = useMemo(() => {
    if (!brandId) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;
    const cleaned = rows
      .map((r) => ({
        itemName: String(r.itemName || "").trim(),
        uom: String(r.uom || "").trim(),
        issueQty: Number(r.issueQty),
        usedQty: Number(r.usedQty),
        wastageQty: Number(r.wastageQty),
        remainingQty: Number(r.remainingQty),
      }))
      .filter((r) => r.itemName);
    if (cleaned.length === 0) return false;
    return cleaned.every(
      (r) =>
        r.uom &&
        [r.issueQty, r.usedQty, r.wastageQty, r.remainingQty].every(
          (n) => Number.isFinite(n) && n >= 0
        )
    );
  }, [brandId, date, rows]);

  const updateRow = (idx, patch) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    setError("");
    setSuccess("");
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (idx) =>
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const items = rows
        .map((r) => ({
          itemName: String(r.itemName || "").trim(),
          uom: String(r.uom || "").trim(),
          issueQty: Number(r.issueQty),
          usedQty: Number(r.usedQty),
          wastageQty: Number(r.wastageQty),
          remainingQty: Number(r.remainingQty),
        }))
        .filter((r) => r.itemName);

      const res = await api.post("/api/stock-updates", {
        brandId,
        date,
        items,
      });
      if (res.data?.success) setSuccess("Stock saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="glass-card p-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient">Stock Update</span>
            </h1>
            <p className="text-gray-600">
              Record daily ingredient stock movement for a client brand.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client brand
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="input-field"
                  disabled={loadingBrands}
                >
                  {brands.length === 0 && <option value="">No brands</option>}
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.brandName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(error || success) && (
              <div
                className={`mt-6 px-4 py-3 rounded-xl text-sm font-medium border ${
                  error
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {error || success}
              </div>
            )}
          </div>

          <div className="glass-card p-6 overflow-x-auto">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold">
                <span className="text-gradient">Ingredients</span>
              </h2>
              <button type="button" onClick={addRow} className="btn-secondary">
                Add Ingredient
              </button>
            </div>

            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Item</th>
                  <th className="p-3 text-left w-32">UOM</th>
                  <th className="p-3 text-right w-40">Issue Qty</th>
                  <th className="p-3 text-right w-40">Actual Used</th>
                  <th className="p-3 text-right w-40">Wastage</th>
                  <th className="p-3 text-right w-44">Remaining</th>
                  <th className="p-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">
                      <input
                        value={r.itemName}
                        onChange={(e) => updateRow(idx, { itemName: e.target.value })}
                        className="input-field"
                        placeholder="e.g. Tomato"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={r.uom}
                        onChange={(e) => updateRow(idx, { uom: e.target.value })}
                        className="input-field"
                      >
                        {UOM_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={r.issueQty}
                        onChange={(e) => updateRow(idx, { issueQty: e.target.value })}
                        className="input-field text-right"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={r.usedQty}
                        onChange={(e) => updateRow(idx, { usedQty: e.target.value })}
                        className="input-field text-right"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={r.wastageQty}
                        onChange={(e) => updateRow(idx, { wastageQty: e.target.value })}
                        className="input-field text-right"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={r.remainingQty}
                        onChange={(e) => updateRow(idx, { remainingQty: e.target.value })}
                        className="input-field text-right"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="text-red-600 hover:text-red-700 font-semibold"
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave || saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

