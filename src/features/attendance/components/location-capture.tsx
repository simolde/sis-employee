"use client";

type LocationCaptureProps = {
  disabled: boolean;
};

export function LocationCapture({ disabled }: LocationCaptureProps) {
  function handleGetLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitudeInput = document.getElementById(
          "latitude",
        ) as HTMLInputElement | null;
        const longitudeInput = document.getElementById(
          "longitude",
        ) as HTMLInputElement | null;

        if (latitudeInput) {
          latitudeInput.value = String(position.coords.latitude);
        }

        if (longitudeInput) {
          longitudeInput.value = String(position.coords.longitude);
        }
      },
      () => {
        alert("Unable to get location. Please allow location permission.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  return (
    <button
      type="button"
      className="starland-btn starland-btn-soft"
      onClick={handleGetLocation}
      disabled={disabled}
    >
      Get GPS Location
    </button>
  );
}