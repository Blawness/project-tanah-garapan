# 🏗️ Sistem Pembelian Sertifikat Tanah Garapan dari Warga

## 📋 Overview

Sistem ini memungkinkan client untuk membeli sertifikat tanah garapan dari warga untuk keperluan pembangunan proyek. Sistem mendukung pembelian massal dengan tracking budget, negosiasi, kontrak, dan pembayaran bertahap.

## 🎯 Fitur Utama

### 1. **Manajemen Proyek Pembangunan**
- Buat dan kelola proyek pembangunan
- Tracking budget (total vs terpakai)
- Timeline dan milestone proyek
- Dashboard overview proyek

### 2. **Pembelian dari Warga**
- Pilih tanah garapan yang tersedia
- Proses negosiasi harga dengan warga
- Generate kontrak pembelian
- Sistem pembayaran bertahap (DP → Pelunasan)
- Generate sertifikat kepemilikan

### 3. **Dashboard Pembelian**
- Overview pembelian per proyek
- Status tracking setiap pembelian
- Payment tracker ke warga
- Budget control per proyek

## 🗄️ Database Schema

### Model Utama
- **ProyekPembangunan**: Data proyek pembangunan
- **PembelianSertifikat**: Pembelian tanah dari warga
- **PembayaranPembelian**: Pencatatan pembayaran ke warga

### Status Workflow
```
Tanah Tersedia → Negosiasi → Kontrak → DP → Sertifikat → Pelunasan → Selesai
```

## 🚀 Halaman Utama

### Proyek
- `/proyek` - Dashboard proyek
- `/proyek/create` - Buat proyek baru
- `/proyek/[id]` - Detail proyek
- `/proyek/[id]/pembelian` - Daftar pembelian

### Pembelian
- `/pembelian` - Dashboard pembelian
- `/pembelian/available` - Tanah tersedia
- `/pembelian/negotiation` - Proses negosiasi
- `/pembelian/contracts` - Kontrak pembelian
- `/pembelian/payments` - Pembayaran ke warga

## 🔧 Komponen Utama

- `ProyekForm` - Form proyek
- `PembelianForm` - Form pembelian
- `NegotiationCard` - Card negosiasi
- `ContractGenerator` - Generate kontrak
- `PaymentTracker` - Tracking pembayaran
- `BudgetChart` - Grafik budget

## 📊 Workflow Pembelian

1. **Pilih Proyek** → Buat/select proyek pembangunan
2. **Pilih Tanah** → Filter dan pilih tanah garapan
3. **Negosiasi** → Negosiasi harga dengan warga
4. **Kontrak** → Generate dan tanda tangan kontrak
5. **Pembayaran DP** → Bayar uang muka ke warga
6. **Proses Sertifikat** → Generate sertifikat kepemilikan
7. **Pelunasan** → Bayar sisa pembayaran
8. **Selesai** → Tanah masuk ke proyek

## 🎨 UI/UX Features

- **Map View**: Peta lokasi tanah dengan pins
- **Bulk Selection**: Pilih multiple tanah sekaligus
- **Real-time Status**: Update status real-time
- **Mobile Responsive**: Optimized untuk mobile
- **Advanced Filtering**: Filter tanah berdasarkan kriteria

## 🔐 Role Permissions

| Feature | Developer | Admin | Manager | User |
|---------|-----------|-------|---------|------|
| View Proyek | ✅ | ✅ | ✅ | ✅ |
| Create Proyek | ✅ | ✅ | ✅ | ❌ |
| Manage Pembelian | ✅ | ✅ | ✅ | ❌ |
| View Budget | ✅ | ✅ | ✅ | ❌ |
| Manage Payment | ✅ | ✅ | ❌ | ❌ |

## 📈 Reporting

- **Project ROI**: Return on investment per proyek
- **Purchase Summary**: Ringkasan pembelian per periode
- **Warga Database**: Database warga yang sudah menjual
- **Land Inventory**: Inventory tanah yang sudah dibeli
- **Budget Reports**: Laporan budget per proyek

---

*Sistem ini terintegrasi dengan sistem tanah garapan existing untuk memudahkan proses pembelian massal dari warga.*
