import "server-only";

type OdooConfig = {
  url: URL;
  database: string;
  username: string;
  password: string;
};

type JsonRpcEnvelope = {
  result?: unknown;
  error?: unknown;
};

type JsonRpcError = {
  message?: unknown;
  data?: {
    message?: unknown;
  };
};

export type OdooConnectionErrorCode =
  | "not_configured"
  | "authentication_failed"
  | "unavailable"
  | "invalid_response"
  | "request_failed";

export class OdooConnectionError extends Error {
  constructor(
    public readonly code: OdooConnectionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OdooConnectionError";
  }
}

function readConfig(): OdooConfig {
  const { ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD } = process.env;
  if (!ODOO_URL || !ODOO_DB || !ODOO_USERNAME || !ODOO_PASSWORD) {
    throw new OdooConnectionError(
      "not_configured",
      "Odoo connection is not configured.",
    );
  }

  let url: URL;
  try {
    url = new URL(ODOO_URL);
  } catch {
    throw new OdooConnectionError(
      "not_configured",
      "The Odoo URL configuration is invalid.",
    );
  }

  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1" ||
      url.hostname === "[::1]");
  if (
    (url.protocol !== "https:" && !isLocalHttp) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new OdooConnectionError(
      "not_configured",
      "The Odoo URL must use HTTPS, except for local development.",
    );
  }

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return { url, database: ODOO_DB, username: ODOO_USERNAME, password: ODOO_PASSWORD };
}

function asJsonRpcEnvelope(value: unknown): JsonRpcEnvelope {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new OdooConnectionError(
      "invalid_response",
      "Odoo returned an invalid response.",
    );
  }
  return value as JsonRpcEnvelope;
}

function getSessionId(response: Response): string | undefined {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headers.getSetCookie?.().join(",") ?? response.headers.get("set-cookie") ?? "";
  return /(?:^|,\s*)session_id=([^;,\s]+)/.exec(cookies)?.[1];
}

export class OdooClient {
  private constructor(private readonly config: OdooConfig) {}

  static fromEnvironment() {
    return new OdooClient(readConfig());
  }

  async verifyConnection(): Promise<void> {
    const sessionId = await this.authenticate();
    const { result: sessionInfo } = await this.rpc(
      "web/session/get_session_info",
      {},
      sessionId,
    );
    if (typeof sessionInfo !== "object" || sessionInfo === null) {
      throw new OdooConnectionError(
        "invalid_response",
        "Odoo returned an invalid session response.",
      );
    }
  }

  async call<T>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<T> {
    const sessionId = await this.authenticate();
    const { result } = await this.rpc(
      `web/dataset/call_kw/${encodeURIComponent(model)}/${encodeURIComponent(method)}`,
      { model, method, args, kwargs },
      sessionId,
    );
    return result as T;
  }

  private async authenticate(): Promise<string> {
    const { result, sessionId } = await this.rpc("web/session/authenticate", {
      db: this.config.database,
      login: this.config.username,
      password: this.config.password,
    });
    if (typeof result !== "object" || result === null || !("uid" in result) || typeof result.uid !== "number") {
      throw new OdooConnectionError(
        "authentication_failed",
        "Odoo authentication failed. Check the configured database and credentials.",
      );
    }
    if (!sessionId) {
      throw new OdooConnectionError(
        "invalid_response",
        "Odoo did not establish an authenticated session.",
      );
    }
    return sessionId;
  }

  private async rpc(
    path: string,
    params: Record<string, unknown>,
    sessionId?: string,
  ): Promise<{ result: unknown; sessionId?: string }> {
    let response: Response;
    try {
      response = await fetch(new URL(path, this.config.url), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(sessionId ? { cookie: `session_id=${sessionId}` } : {}),
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params,
          id: Date.now(),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new OdooConnectionError(
        "unavailable",
        "Odoo could not be reached from the Next.js server.",
      );
    }

    let envelope: JsonRpcEnvelope;
    try {
      envelope = asJsonRpcEnvelope(await response.json());
    } catch (error) {
      if (error instanceof OdooConnectionError) throw error;
      throw new OdooConnectionError(
        "invalid_response",
        "Odoo returned an invalid response.",
      );
    }

    if (!response.ok || envelope.error) {
      const rpcError = envelope.error as JsonRpcError | undefined;
      const message = rpcError?.data?.message ?? rpcError?.message;
      if (path === "web/session/authenticate" || typeof message === "string" && /access denied|invalid login|authentication/i.test(message)) {
        throw new OdooConnectionError(
          "authentication_failed",
          "Odoo authentication failed. Check the configured database and credentials.",
        );
      }
      throw new OdooConnectionError(
        "request_failed",
        "Odoo could not complete the requested operation.",
      );
    }

    return {
      result: envelope.result,
      ...(path === "web/session/authenticate"
        ? { sessionId: getSessionId(response) }
        : {}),
    };
  }
}
