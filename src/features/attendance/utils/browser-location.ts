export type BrowserLocationResult = {
  latitude: string;
  longitude: string;
  address: string;
};

type ReverseGeocodeResponse = {
  display_name?: string;
  error?: string;
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
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to convert GPS coordinates to full address.");
  }

  const data = (await response.json()) as ReverseGeocodeResponse;

  if (!data.display_name) {
    throw new Error("Full address was not found for this location.");
  }

  return data.display_name;
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