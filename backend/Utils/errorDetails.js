export function errorDetails(error) {
  return process.env.NODE_ENV === "production" ? undefined : error.message;
}
