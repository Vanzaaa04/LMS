# Auth Module - Ariel
**Branch:** `fitur/backend-api-auth-ariel`

Modul autentikasi (gerbang masuk aplikasi). Terdiri dari dua endpoint:

---

## 1. Register - `POST /auth/register`
Endpoint untuk mendaftarkan akun baru ke dalam sistem.

**Yang dilakukan:**
- Menerima data `name`, `email`, `password`, dan `role` (STUDENT / LECTURER / ADMIN)
- Cek email duplikat → jika sudah ada, return error 409 "Email sudah terdaftar"
- Hash password pakai bcrypt (salt rounds 10)
- Simpan user baru ke tabel User via Prisma
- Return data user tanpa password

**Contoh Request:**
```json
{
  "name": "Dosen Test",
  "email": "dosen@test.com",
  "password": "password123",
  "role": "LECTURER"
}
```

**Contoh Response:**
```json
{
  "id": "29dc4f7d-...",
  "name": "Dosen Test",
  "email": "dosen@test.com",
  "role": "LECTURER",
  "xp": 0,
  "createdAt": "2026-05-01T...",
  "updatedAt": "2026-05-01T..."
}
```

---

## 2. Login - `POST /auth/login`
Endpoint untuk masuk ke akun dan mendapatkan JWT Token.

**Yang dilakukan:**
- Menerima `email` dan `password`
- Cari user berdasarkan email → jika tidak ada, return error 401 "Email tidak ditemukan"
- Cocokkan password pakai bcrypt.compare → jika salah, return error 401 "Password salah"
- Jika cocok, buat JWT Token (berisi ID + Role user, berlaku 24 jam)
- Return access_token beserta data user

**Contoh Request:**
```json
{
  "email": "dosen@test.com",
  "password": "password123"
}
```

**Contoh Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "29dc4f7d-...",
    "name": "Dosen Test",
    "email": "dosen@test.com",
    "role": "LECTURER"
  }
}
```

---

## File yang dikerjakan

| File | Keterangan |
|------|-----------|
| `auth.service.ts` | Logika register (hash bcrypt) dan login (compare + JWT sign) |
| `auth.controller.ts` | Route POST /auth/register dan POST /auth/login |
| `auth.module.ts` | Konfigurasi JwtModule (secret, expire 24h) dan PrismaService |
