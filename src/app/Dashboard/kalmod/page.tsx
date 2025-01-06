"use client";

import { useState } from "react";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Container } from "@/components/Container";

interface FixedCost {
  id: number;
  description: string;
  amount: number;
}

interface VariableCost {
  id: number;
  description: string;
  amount: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  costPerUnit: number;
  estimatedSalesPerMonth: number;
  type: "product" | "service"; // Menambahkan tipe untuk membedakan produk dan jasa
}

export default function Kalmod() {
  const [businessType, setBusinessType] = useState<"product" | "service">("product");
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [newFixedCost, setNewFixedCost] = useState({ description: "", amount: "" });
  const [newVariableCost, setNewVariableCost] = useState({ description: "", amount: "" });
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: "", 
    costPerUnit: "",
    estimatedSalesPerMonth: "",
    type: "product" as "product" | "service"
  });

  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') {
      num = num.replace(/,/g, '');
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalVariableCosts = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);

  const calculateItemDetails = (item: Product) => {
    const revenue = item.price * item.estimatedSalesPerMonth;
    const costs = item.costPerUnit * item.estimatedSalesPerMonth;
    const profit = revenue - costs;
    return { revenue, costs, profit };
  };
  
  const calculateMonthlyProfit = () => {
    const itemProfits = products.reduce((total, item) => {
      const { profit } = calculateItemDetails(item);
      return total + profit;
    }, 0);
    return itemProfits - (totalVariableCosts + totalFixedCosts);
  };

  const calculateBreakEven = () => {
    const monthlyProfit = calculateMonthlyProfit();
    if (monthlyProfit <= 0) {
      return {
        status: "Rugi",
        message: "Belum bisa dihitung karena masih rugi",
        monthlyProfit,
        details: "Usaha masih mengalami kerugian. Pertimbangkan untuk mengurangi biaya atau meningkatkan pendapatan."
      };
    }
    
    const totalInvestment = totalFixedCosts + totalVariableCosts;
    const monthsToBreakEven = totalInvestment / monthlyProfit;
    const years = Math.floor(monthsToBreakEven / 12);
    const months = Math.ceil(monthsToBreakEven % 12);
    
    return {
      status: "Untung",
      message: `${years > 0 ? `${years} tahun ${months} bulan` : `${months} bulan`}`,
      monthlyProfit,
      details: `Dengan keuntungan Rp ${formatNumber(monthlyProfit)} per bulan, modal akan kembali dalam ${years > 0 ? `${years} tahun ${months} bulan` : `${months} bulan`}`
    };
  };

  // Handler functions remain the same but with type consideration
  const handleAddFixedCost = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newFixedCost.amount.replace(/,/g, ''));
    if (isNaN(amount)) return;
    setFixedCosts([...fixedCosts, { id: fixedCosts.length + 1, description: newFixedCost.description, amount }]);
    setNewFixedCost({ description: "", amount: "" });
  };

  const handleAddVariableCost = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newVariableCost.amount.replace(/,/g, ''));
    if (isNaN(amount)) return;
    setVariableCosts([...variableCosts, { id: variableCosts.length + 1, description: newVariableCost.description, amount }]);
    setNewVariableCost({ description: "", amount: "" });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newProduct.price.replace(/,/g, ''));
    const costPerUnit = parseFloat(newProduct.costPerUnit.replace(/,/g, ''));
    const estimatedSales = parseFloat(newProduct.estimatedSalesPerMonth);
    if (isNaN(price) || isNaN(costPerUnit) || isNaN(estimatedSales)) return;
    
    setProducts([...products, {
      id: products.length + 1,
      name: newProduct.name,
      price,
      costPerUnit,
      estimatedSalesPerMonth: estimatedSales,
      type: newProduct.type
    }]);
    
    setNewProduct({
      name: "",
      price: "",
      costPerUnit: "",
      estimatedSalesPerMonth: "",
      type: businessType
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <Container>
        <div className="py-8 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Kalkulator Modal Usaha</h1>

          {/* Tipe Usaha Selector */}
          <div className="mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Pilih Jenis Usaha</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setBusinessType("product")}
                  className={`flex-1 py-3 px-6 rounded-lg ${businessType === "product" ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                  Produk Fisik
                </button>
                <button
                  onClick={() => setBusinessType("service")}
                  className={`flex-1 py-3 px-6 rounded-lg ${businessType === "service" ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                  Jasa/Rental
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Modal Awal Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Modal Awal</h2>
              <p className="text-gray-600 mb-4">
                {businessType === "product" 
                  ? "Masukkan biaya awal seperti sewa tempat, peralatan, stok barang, dll."
                  : "Masukkan biaya awal seperti sewa tempat, peralatan rental, perlengkapan jasa, dll."}
              </p>
              <form onSubmit={handleAddFixedCost} className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder={businessType === "product" ? "Contoh: Stok Barang" : "Contoh: Peralatan Rental"}
                  value={newFixedCost.description}
                  onChange={(e) => setNewFixedCost({...newFixedCost, description: e.target.value})}
                  className="flex-1 px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Jumlah (Rp)"
                  value={newFixedCost.amount}
                  onChange={(e) => setNewFixedCost({...newFixedCost, amount: formatNumber(e.target.value)})}
                  className="w-40 px-4 py-2 border rounded-lg"
                  required
                />
                <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Tambah
                </button>
              </form>
              
              <div className="space-y-2">
                {fixedCosts.map(cost => (
                  <div key={cost.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>{cost.description}</span>
                    <span className="font-medium">Rp {formatNumber(cost.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg font-semibold">
                  <span>Total Modal Awal:</span>
                  <span>Rp {formatNumber(totalFixedCosts)}</span>
                </div>
              </div>
            </div>

            {/* Biaya Operasional Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Biaya Operasional Bulanan</h2>
              <p className="text-gray-600 mb-4">
                {businessType === "product"
                  ? "Masukkan biaya rutin bulanan seperti gaji, listrik, internet, dll."
                  : "Masukkan biaya rutin bulanan seperti maintenance, gaji, listrik, dll."}
              </p>
              <form onSubmit={handleAddVariableCost} className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Deskripsi Biaya"
                  value={newVariableCost.description}
                  onChange={(e) => setNewVariableCost({...newVariableCost, description: e.target.value})}
                  className="flex-1 px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Jumlah (Rp)"
                  value={newVariableCost.amount}
                  onChange={(e) => setNewVariableCost({...newVariableCost, amount: formatNumber(e.target.value)})}
                  className="w-40 px-4 py-2 border rounded-lg"
                  required
                />
                <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Tambah
                </button>
              </form>
              
              <div className="space-y-2">
                {variableCosts.map(cost => (
                  <div key={cost.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>{cost.description}</span>
                    <span className="font-medium">Rp {formatNumber(cost.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg font-semibold">
                  <span>Total Biaya Bulanan:</span>
                  <span>Rp {formatNumber(totalVariableCosts)}</span>
                </div>
              </div>
            </div>

            {/* Produk/Jasa Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">
                {businessType === "product" ? "Produk yang Dijual" : "Layanan/Item Rental"}
              </h2>
              <p className="text-gray-600 mb-4">
                {businessType === "product"
                  ? "Masukkan detail produk yang akan dijual beserta estimasi penjualan per bulan"
                  : "Masukkan detail layanan atau item rental beserta estimasi penggunaan per bulan"}
              </p>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder={businessType === "product" ? "Nama Produk" : "Nama Layanan/Item"}
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder={businessType === "product" ? "Harga Jual (Rp)" : "Harga Sewa (Rp)"}
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: formatNumber(e.target.value)})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder={businessType === "product" ? "Modal per Produk (Rp)" : "Biaya per Layanan (Rp)"}
                  value={newProduct.costPerUnit}
                  onChange={(e) => setNewProduct({...newProduct, costPerUnit: formatNumber(e.target.value)})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder={businessType === "product" ? "Target Jual per Bulan" : "Target Sewa per Bulan"}
                  value={newProduct.estimatedSalesPerMonth}
                  onChange={(e) => setNewProduct({...newProduct, estimatedSalesPerMonth: e.target.value})}
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <button type="submit" className="md:col-span-2 lg:col-span-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Tambah {businessType === "product" ? "Produk" : "Layanan"}
                </button>
              </form>

              {products.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="p-3 rounded-l-lg">{businessType === "product" ? "Produk" : "Layanan/Item"}</th>
                        <th className="p-3">{businessType === "product" ? "Harga Jual" : "Harga Sewa"}</th>
                        <th className="p-3">{businessType === "product" ? "Modal/Unit" : "Biaya/Layanan"}</th>
                        <th className="p-3">Target/Bulan</th>
                        <th className="p-3 rounded-r-lg">Profit/Bulan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.map(item => {
                        const details = calculateItemDetails(item);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-3">{item.name}</td>
                            <td className="p-3">Rp {formatNumber(item.price)}</td>
                            <td className="p-3">Rp {formatNumber(item.costPerUnit)}</td>
                            <td className="p-3">{formatNumber(item.estimatedSalesPerMonth)}</td>
                            <td className="p-3 text-green-600 font-medium">
                              Rp {formatNumber(details.profit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Analisis Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Hasil Analisis Usaha</h2>
              
              {(() => {
                const analysis = calculateBreakEven();
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium mb-3">Modal & Biaya</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Modal Awal:</span>
                            <span>Rp {formatNumber(totalFixedCosts)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Biaya Operasional/Bulan:</span>
                            <span>Rp {formatNumber(totalVariableCosts)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-blue-200">
                            <span>Total Investasi:</span>
                            <span className="font-bold">Rp {formatNumber(totalFixedCosts + totalVariableCosts)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium mb-3">Proyeksi Bulanan</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Status Usaha:</span>
                            <span className={analysis.status === "Untung" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                              {analysis.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Profit per Bulan:</span>
                            <span className={`font-bold ${analysis.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Rp {formatNumber(analysis.monthlyProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3">Estimasi Balik Modal</h3>
                      <p className="text-gray-700">{analysis.details}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
