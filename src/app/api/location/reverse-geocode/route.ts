import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReverseGeocodeResponse = {
  display_name?: string;
  error?: string;
};

type ReverseGeocodeResult = {
  ok: boolean;
  message: string;
  address?: string;
};

function jsonResponse(body: ReverseGeocodeResult, status: number) {
  return NextResponse.json(body, {
    status,
  });
}

function isValidCoordinate(value: string | null): value is string {
  if (!value) {
    return false;
  }

  if (!/^-?\d+(\.\d+)?$/.test(value)) {
    return false;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed);
}

function isValidLatitude(value: string): boolean {
  const parsed = Number(value);

  return parsed >= -90 && parsed <= 90;
}

function isValidLongitude(value: string): boolean {
  const parsed = Number(value);

  return parsed >= -180 && parsed <= 180;
}

async function safeReadJson(response: Response): Promise<ReverseGeocodeResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      error: "Reverse geocode provider returned a non-JSON response.",
    };
  }

  try {
    return (await response.json()) as ReverseGeocodeResponse;
  } catch {
    return {
      error: "Reverse geocode provider returned invalid JSON.",
    };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = url.searchParams.get("lat");
  const longitude = url.searchParams.get("lng");

  if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
    return jsonResponse(
      {
        ok: false,
        message: "Valid latitude and longitude are required.",
      },
      400,
    );
  }

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return jsonResponse(
      {
        ok: false,
        message: "Latitude or longitude is outside the valid GPS range.",
      },
      400,
    );
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: latitude,
    lon: longitude,
    zoom: "18",
    addressdetails: "1",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": `${env.NEXT_PUBLIC_APP_NAME}/1.0 (${env.MAIL_FROM_EMAIL})`,
        },
        cache: "no-store",
      },
    );

    const data = await safeReadJson(response);

    if (!response.ok) {
      return jsonResponse(
        {
          ok: false,
          message:
            data.error ||
            "Unable to convert GPS coordinates to full address.",
        },
        502,
      );
    }

    if (!data.display_name) {
      return jsonResponse(
        {
          ok: false,
          message:
            data.error || "Full address was not found for this location.",
        },
        404,
      );
    }

    return jsonResponse(
      {
        ok: true,
        message: "Address found.",
        address: data.display_name,
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        ok: false,
        message:
          "Reverse geocode service is temporarily unavailable. Please try again.",
      },
      502,
    );
  }
}