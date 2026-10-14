import { NextResponse } from "next/server";
import { OdooClient, OdooConnectionError } from "@/lib/api/odoo-client";

export async function GET() {
  try {
    await OdooClient.fromEnvironment().verifyConnection();
    return NextResponse.json({ connected: true });
  } catch (error) {
    const code = error instanceof OdooConnectionError ? error.code : "request_failed";
    const message =
      error instanceof OdooConnectionError
        ? error.message
        : "Odoo connection could not be verified.";
    return NextResponse.json(
      { connected: false, error: { code, message } },
      { status: 503 },
    );
  }
}
