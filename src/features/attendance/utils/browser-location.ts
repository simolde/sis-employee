export type BrowserLocationResult = {
  latitude: string;
  longitude: string;
  address: string;
};

type ReverseGeocodeResult = {
  ok: boolean;
  message: string;
  address?: string;
};

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
  });

  const response = await fetch(
    `/api/location/reverse-geocode?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const result = (await response.json()) as ReverseGeocodeResult;

  if (!response.ok || !result.ok || !result.address) {
    throw new Error(result.message || "Unable to convert GPS to full address.");
  }

  return result.address;
}

export async function getBrowserLocationWithAddress(): Promise<BrowserLocationResult> {
  const position = await getCurrentPosition();

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const address = await reverseGeocode(latitude, longitude);

  return {
    latitude: String(latitude),
    longitude: String(longitude),
    address,
  };
}