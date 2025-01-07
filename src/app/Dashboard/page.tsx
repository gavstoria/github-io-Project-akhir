"use client";

import { useState, useEffect } from "react";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Container } from "@/components/Container";
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckfacmggijsjvrfkjudv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZmFjbWdnaWpzanZyZmtqdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyOTE5NTgsImV4cCI6MjA1MDg2Nzk1OH0.LGtG_bl2-kJJKBIYT0T1PIi46Mh8qjXOPSGwc9sKtpI'
);

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  date: string;
  user_id: string;
  category?: string;
  payment_method?: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "income",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    payment_method: "cash"
  });

  const categories = {
    income: ["Penjualan", "Investasi", "Lainnya"],
    expense: ["Bahan Baku", "Gaji", "Operasional", "Marketing", "Lainnya"]
  };

  const paymentMethods = ["cash", "transfer", "debit", "credit"];

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpense;

  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') {
      num = num.replace(/,/g, '');
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setTransactions(data as Transaction[]);
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          throw new Error("No authenticated user");
        }
      } catch (err) {
        setError("Failed to get user session");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = parseFloat(newTransaction.amount.replace(/,/g, ''));
      if (isNaN(amount)) throw new Error("Invalid amount");
      
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert([
          {
            type: newTransaction.type,
            amount: amount,
            description: newTransaction.description,
            date: newTransaction.date,
            category: newTransaction.category,
            payment_method: newTransaction.payment_method,
            user_id: userId
          }
        ])
        .select();

      if (insertError) throw insertError;

      if (data) {
        setTransactions([...transactions, data[0] as Transaction]);
        setShowTransactionForm(false);
        setNewTransaction({
          type: "income",
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          category: "",
          payment_method: "cash"
        });
      }
    } catch (err) {
      setError("Failed to add transaction");
      console.error(err);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      value = formatNumber(parseInt(value));
    }
    setNewTransaction({...newTransaction, amount: value});
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        setTransactions(transactions.filter(t => t.id !== id));
      } catch (err) {
        setError("Failed to delete transaction");
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardNavbar />
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center transition-all duration-300">
            BizzPlanner Dashboard
          </h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Total Pemasukan", value: totalIncome, color: "green" },
              { title: "Total Pengeluaran", value: totalExpense, color: "red" },
              { title: "Laba/Rugi", value: profit, color: profit >= 0 ? "green" : "red" }
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{item.title}</h3>
                <p className={`text-3xl font-bold text-${item.color}-600`}>
                  Rp {formatNumber(item.value)}
                </p>
                <div className={`h-1 w-20 bg-${item.color}-600 mt-4 rounded-full`}></div>
              </div>
            ))}
          </div>

          {/* Transaction List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaksi Terbaru</h2>
              <button
                onClick={() => setShowTransactionForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                + Tambah Transaksi
              </button>
            </div>

            {/* Transaction Form Modal */}
            {showTransactionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Tambah Transaksi Baru</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Transaksi</label>
                        <select
                          value={newTransaction.type}
                          onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value, category: ""})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          <option value="income">Pemasukan</option>
                          <option value="expense">Pengeluaran</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                        <select
                          value={newTransaction.category}
                          onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                          required
                        >
                          <option value="">Pilih Kategori</option>
                          {categories[newTransaction.type as keyof typeof categories].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah (Rp)</label>
                        <input
                          type="text"
                          value={newTransaction.amount}
                          onChange={handleAmountChange}
                          placeholder="0"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                        <input
                          type="text"
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metode Pembayaran</label>
                        <select
                          value={newTransaction.payment_method}
                          onChange={(e) => setNewTransaction({...newTransaction, payment_method: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                          required
                        >
                          {paymentMethods.map(method => (
                            <option key={method} value={method}>
                              {method.charAt(0).toUpperCase() + method.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                        <input
                          type="date"
                          value={newTransaction.date}
                          onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowTransactionForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr 
                      key={transaction.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.payment_method ? 
                          transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1) 
                          : 'Cash'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Rp {formatNumber(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
