import { useEffect } from "react";
import axios from "axios";

export const Visitor = () => {
  const backendUrl = "https://api.socialclubs.fun";
  const projectName = "YouTube Channel Tracker";
  const PROJECT_NAME = projectName.toLowerCase().split(" ").join("");

  const getBrowserFingerprint = () => {
    return btoa(
      `${navigator.userAgent}-${screen.width}x${screen.height}-${
        Intl.DateTimeFormat().resolvedOptions().timeZone
      }`
    );
  };

  const getDeviceId = () => {
    let deviceId = localStorage.getItem(`${PROJECT_NAME}_device_id`);
    if (!deviceId) {
      deviceId = PROJECT_NAME + "-" + getBrowserFingerprint();
      localStorage.setItem(`${PROJECT_NAME}_device_id`, deviceId);
    }
    return deviceId;
  };

  const sendTrackingData = async () => {
    const deviceId = getDeviceId();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          await axios.get(`${backendUrl}/api/v1/visit/track`, {
            params: {
              latitude,
              longitude,
              deviceId,
              projectName,
            },
          });
        } catch (error) {
          console.error("Error sending location:", error);
        }
      },
      async (error) => {
        console.warn("Geolocation failed, falling back to IP:", error.message);

        try {
          const response = await axios.get(
            "https://api64.ipify.org?format=json"
          );
          const ip = PROJECT_NAME + "-" + response.data.ip;

          await axios.get(`${backendUrl}/api/v1/visit/track`, {
            params: { ip, deviceId, projectName },
          });
        } catch (error) {
          console.error("Error fetching/sending IP:", error);
        }
      }
    );
  };

  useEffect(() => {
    sendTrackingData();
  }, []);

  return null;
};
