import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

export default function CheckStock() {
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dates, setDates] = useState([]);

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

  const loadStock = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/stock-updates", { params: { brandId: id } });
      setDates(res.data?.data || []);
    } catch (err) {
      setDates([]);
      setError(err.response?.data?.message || "Failed to load stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) loadStock(brandId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  const brandName = useMemo(() => brands.find((b) => b._id === brandId)?.brandName, [brands, brandId]);

  return (
    <Layout>
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="glass-card p-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient">Check Stock</span>
            </h1>
            <p className="text-gray-600">
              View saved stock updates date-wise for a client brand.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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

              <div className="flex md:justify-end">
                <button
                  type="button"
                  onClick={() => loadStock(brandId)}
                  className="btn-secondary"
                  disabled={!brandId || loading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 px-4 py-3 rounded-xl text-sm font-medium border bg-red-50 text-red-700 border-red-200">
                {error}
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center text-gray-600">Loading…</div>
          )}

          {!loading && dates.length === 0 && (
            <div className="glass-card p-10 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600">No stock updates found for {brandName || "this brand"}.</p>
            </div>
          )}

          {!loading &&
            dates.map((d) => (
              <div key={d._id} className="glass-card p-6 overflow-x-auto">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-bold">
                    <span className="text-gradient">{d.date}</span>
                  </h2>
                  <span className="text-sm text-gray-500">{d.brandName}</span>
                </div>

                <table className="min-w-[1000px] w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-left w-28">UOM</th>
                      <th className="p-3 text-right w-40">Issue Qty</th>
                      <th className="p-3 text-right w-40">Actual Used</th>
                      <th className="p-3 text-right w-40">Wastage</th>
                      <th className="p-3 text-right w-44">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.items || []).map((it, idx) => (
                      <tr key={`${it.itemName}-${idx}`} className="border-t">
                        <td className="p-3 font-medium">{it.itemName}</td>
                        <td className="p-3">{it.uom}</td>
                        <td className="p-3 text-right">{Number(it.issueQty || 0).toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right">{Number(it.usedQty || 0).toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right">{Number(it.wastageQty || 0).toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-semibold">{Number(it.remainingQty || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}

