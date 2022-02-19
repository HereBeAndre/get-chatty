const { MAPS_BASE_URL } = require("./constants");

const geoLocationRequestBuilder = (coordinates, baseUrl = MAPS_BASE_URL) => {
  const { latitude, longitude } = coordinates;
  const searchParams = new URLSearchParams(`q=${latitude},${longitude}`);
  return `${baseUrl}?${searchParams}`;
};

module.exports = { geoLocationRequestBuilder };
