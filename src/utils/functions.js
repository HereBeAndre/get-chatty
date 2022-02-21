const { MAPS_BASE_URL } = require("./constants");

const geoLocationRequestBuilder = (coordinates, baseUrl = MAPS_BASE_URL) => {
  const { latitude, longitude } = coordinates;
  const searchParams = new URLSearchParams(`q=${latitude},${longitude}`);
  return `${baseUrl}?${searchParams}`;
};

const generateMessage = (text) => ({
  text,
  createdAt: new Date().getTime(),
});

module.exports = { geoLocationRequestBuilder, generateMessage };
