# Dokumentasi Penggunaan Logger

Berikut contoh penggunaan logger.

```js
// Import Logger di file mana pun
import { applicationLogger } from '../utils/logger.js';

// Log INFO
applicationLogger.info('User membuat akun baru', {
  userId: newUser.id,
  email: newUser.email,
});

// Log WARN
applicationLogger.warn('Koneksi database lambat', {
  duration: '3200ms',
});

// Log ERROR
applicationLogger.error('Gagal mengambil data user', {
  userId,
  errorMessage: error.message,
});

// Log DEBUG
applicationLogger.debug('Memulai proses pemanggilan API eksternal', {
  endpoint,
});
```
