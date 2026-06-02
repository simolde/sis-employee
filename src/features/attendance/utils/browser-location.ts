type BrowserLocationResult = {
  latitude: string;
  longitude: string;
  address: string;
};

type ReverseGeocodeApiResponse = {
  ok: boolean;
  message: string;
  address?: string;
};

function getCurrentBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(
        new Error(
          "Browser geolocation is not supported on this device or browser.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

function geolocationErrorMessage(error: unknown): string {
  if (!(error instanceof GeolocationPositionError)) {
    return "Unable to capture GPS location.";
  }

  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission was denied. Please allow browser location permission and reload the page.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Location information is unavailable. Please check GPS/Wi-Fi/location services and reload the page.";
  }

  if (error.code === error.TIMEOUT) {
    return "Location request timed out. Please reload the page and try again.";
  }

  return "Unable to capture GPS location.";
}

async function readJsonResponse(response: Response): Promise<ReverseGeocodeApiResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await response.text();

    throw new Error(
      text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")
        ? "Reverse geocode API returned HTML instead of JSON. Check that /api/location/reverse-geocode or /api/reverse-geocode exists."
        : "Reverse geocode API returned an invalid response.",
    );
  }

  return (await response.json()) as ReverseGeocodeApiResponse;
}

async function fetchReverseGeocodeAddress(input: {
  latitude: string;
  longitude: string;
}): Promise<string> {
  const params = new URLSearchParams({
    lat: input.latitude,
    lng: input.longitude,
  });

  const endpoints = [
    `/api/location/reverse-geocode?${params.toString()}`,
    `/api/reverse-geocode?${params.toString()}`,
  ];

  let lastErrorMessage = "Unable to convert GPS coordinates to full address.";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await readJsonResponse(response);

      if (!response.ok || !data.ok) {
        lastErrorMessage = data.message || lastErrorMessage;
        continue;
      }

      if (!data.address) {
        lastErrorMessage = "Full address was not found for this location.";
        continue;
      }

      return data.address;
    } catch (error) {
      lastErrorMessage =
        error instanceof Error ? error.message : lastErrorMessage;
    }
  }

  throw new Error(lastErrorMessage);
}

export async function getBrowserLocationWithAddress(): Promise<BrowserLocationResult> {
  try {
    const position = await getCurrentBrowserPosition();

    const latitude = position.coords.latitude.toFixed(7);
    const longitude = position.coords.longitude.toFixed(7);
    const address = await fetchReverseGeocodeAddress({
      latitude,
      longitude,
    });

    return {
      latitude,
      longitude,
      address,
    };
  } catch (error) {
    if (error instanceof GeolocationPositionError) {
      throw new Error(geolocationErrorMessage(error));
    }

    throw error instanceof Error
      ? error
      : new Error("Unable to capture GPS and full address.");
  }
}