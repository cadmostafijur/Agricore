export function json(
  body: unknown,
  init?: ResponseInit & { status?: number }
): Response {
  return Response.json(body, init);
}

export function errorJson(error: unknown): Response {
  const statusCode =
    typeof error === 'object' && error && 'statusCode' in error
      ? Number((error as { statusCode?: unknown }).statusCode) || 500
      : 500;

  const message =
    typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message ?? 'Unexpected error')
      : 'Unexpected error';

  return Response.json({ success: false, message }, { status: statusCode });
}

