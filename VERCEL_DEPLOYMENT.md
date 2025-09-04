# Hướng dẫn Deploy lên Vercel với Environment Variables

## 1. Chuẩn bị trước khi deploy

### Kiểm tra các biến môi trường cần thiết:
- `NEXT_PUBLIC_USS_API_URL` - API URL chính
- `NEXT_PUBLIC_API_KEY` - API Key để xác thực
- `NEXT_PUBLIC_PROJECT_ID` - Project ID
- `NEXT_PUBLIC_BIABIP_API_URL` - Backend API URL

## 2. Cấu hình Environment Variables trên Vercel

### Phương pháp 1: Qua Vercel Dashboard
1. Truy cập https://vercel.com và đăng nhập
2. Chọn project của bạn
3. Vào **Settings** → **Environment Variables**
4. Click **Add New**
5. Thêm từng biến:
   ```
   NEXT_PUBLIC_USS_API_URL = https://api-trieve.ermis.network/uss/v1
   NEXT_PUBLIC_API_KEY = wHFxK7k6bocmqLIaMSkbik25MNgZFUQd
   NEXT_PUBLIC_PROJECT_ID = bc739f16-2b5e-4bd5-b9f4-4c941ff2a032
   NEXT_PUBLIC_BIABIP_API_URL = https://biabip-backend.nvhoangwru.workers.dev
   ```
6. Chọn environment: **Production**, **Preview**, **Development**
7. Click **Save**

### Phương pháp 2: Qua Vercel CLI
```bash
# Install Vercel CLI nếu chưa có
npm i -g vercel

# Login vào Vercel
vercel login

# Thêm environment variables
vercel env add NEXT_PUBLIC_USS_API_URL
vercel env add NEXT_PUBLIC_API_KEY
vercel env add NEXT_PUBLIC_PROJECT_ID
vercel env add NEXT_PUBLIC_BIABIP_API_URL
```

### Phương pháp 3: Sử dụng script tự động
```bash
# Cho phép chạy script
chmod +x setup-vercel-env.sh

# Chạy script
./setup-vercel-env.sh
```

## 3. Deploy ứng dụng

### Deploy qua Git (Recommended)
1. Push code lên GitHub/GitLab/Bitbucket
2. Vercel sẽ tự động deploy khi có commit mới

### Deploy qua CLI
```bash
# Build và deploy
vercel --prod

# Hoặc chỉ deploy
vercel deploy --prod
```

## 4. Xác minh Environment Variables

Sau khi deploy, kiểm tra:
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Đảm bảo tất cả variables đã được set đúng
3. Kiểm tra trong browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)`

## 5. Lưu ý quan trọng

### Security
- ❌ **KHÔNG** commit file `.env.local` vào git
- ✅ Chỉ commit file `.env.example`
- ✅ Sử dụng `NEXT_PUBLIC_` prefix cho client-side variables
- ✅ Variables không có `NEXT_PUBLIC_` chỉ available ở server-side

### Best Practices
- Sử dụng environment khác nhau cho dev/staging/production
- Backup environment variables
- Sử dụng strong API keys và rotate thường xuyên
- Monitor API usage để phát hiện abuse

## 6. Troubleshooting

### Lỗi thường gặp:
1. **Variables không load**: Đảm bảo có prefix `NEXT_PUBLIC_`
2. **Build failed**: Check syntax và format của variables
3. **API calls fail**: Verify API URLs và keys

### Debug:
```javascript
// Trong component để check variables
console.log('Environment:', {
  API_URL: process.env.NEXT_PUBLIC_USS_API_URL,
  API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
  BIABIP_API: process.env.NEXT_PUBLIC_BIABIP_API_URL
});
```
