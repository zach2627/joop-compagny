async function refreshAdminSession() {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "x-auth-intent": "client-refresh",
    },
  });

  return response.ok;
}

export async function fetchWithAdminRefresh(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const requestInit: RequestInit = {
    ...init,
    credentials: init.credentials ?? "include",
  };

  const response = await fetch(input, requestInit);
  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshAdminSession();
  if (!refreshed) {
    return response;
  }

  return fetch(input, requestInit);
}
