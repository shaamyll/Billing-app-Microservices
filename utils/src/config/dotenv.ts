// const requiredEnv = (key: string): string => {
//   const value = process.env[key];
//   if (!value) {
//     throw new Error(`Missing required environment variable: ${key}`);
//   }
//   return value;
// };

// export const env = {
//   NODE_ENV: process.env.NODE_ENV || "development",
//   PORT: process.env.PORT || 5000,

//   DATABASE_URL: process.env.DATABASE_URL,

//   // Access Token
//   JWT_SECRET: requiredEnv("JWT_SECRET"),
//   JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",

//   // Refresh Token
//   JWT_REFRESH_SECRET: requiredEnv("JWT_REFRESH_SECRET"),
//   JWT_REFRESH_EXPIRES_IN:
//     process.env.JWT_REFRESH_EXPIRES_IN || "7d",
// };