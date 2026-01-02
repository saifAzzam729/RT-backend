export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM || 'RT-SYR <info@rt-syr.com>',
  },
  
  storage: {
    path: process.env.STORAGE_PATH || 'uploads',
    baseUrl: process.env.STORAGE_BASE_URL || '/api/storage',
  },
  
  limits: {
    freeJobPosts: 2,
    freeTenderPosts: 2,
    maxFileSize: {
      document: 5 * 1024 * 1024, // 5MB
      image: 2 * 1024 * 1024, // 2MB
    },
  },
});


