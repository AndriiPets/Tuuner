import { NextResponse } from "next/server";

export function middleware() {
  // retrieve the current response
  const res = NextResponse.next();

  // add the CORS headers to the response
  res.headers.append("Cross-Origin-Embedder-Policy", "require-corp");
  res.headers.append("Cross-Origin-Opener-Policy", "same-origin"); // replace this your actual origin
  return res;
}
