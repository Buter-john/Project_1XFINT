import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:4000";

export function corsMiddleware(response) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

export function jsonResponse(body, status = 200) {
  return corsMiddleware(NextResponse.json(body, { status }));
}

export function corsPreflightResponse(methods) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": methods,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}