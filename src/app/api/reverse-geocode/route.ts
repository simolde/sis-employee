import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";

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

  return /^-?\d+(\.\d+)?$/.test(value);
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

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: latitude,
    lon: longitude,
    zoom: "18",
    addressdetails: "1",
  });

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

  if (!response.ok) {
    return jsonResponse(
      {
        ok: false,
        message: "Unable to convert GPS coordinates to full address.",
      },
      502,
    );
  }

  const data = (await response.json()) as ReverseGeocodeResponse;

  if (!data.display_name) {
    return jsonResponse(
      {
        ok: false,
        message: "Full address was not found for this location.",
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
}