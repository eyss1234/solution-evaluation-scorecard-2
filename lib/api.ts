import { NextResponse } from "next/server";

/**
 * Helpers for the consistent API response envelope used by every route handler:
 *   success → { ok: true, data }
 *   failure → { ok: false, error: { message } }
 */

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: { message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Build a success response. Defaults to HTTP 200; pass `status` to override. */
export function apiOk<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

/** Build a failure response with a client-safe message and HTTP status. */
export function apiError(message: string, status = 400): NextResponse<ApiFailure> {
  return NextResponse.json({ ok: false, error: { message } }, { status });
}
