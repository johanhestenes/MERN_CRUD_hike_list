const hikeFieldType = {
  name: 'required',
  distance: 'optional',
  time: 'optional',
  created: 'required',
  elevation: 'optional',
};

function cleanupHike(hike) {
  const cleanedUpHike = {};
  Object.keys(hike).forEach(field => {
    if (hikeFieldType[field]) cleanedUpHike[field] = hike[field];
  });
  return cleanedUpHike;
}

function convertHike(hike) {
  if (hike.created) hike.created = new Date(hike.created);
  return cleanupHike(hike);
}

function validateHike(hike) {
  const errors = [];
  Object.keys(hikeFieldType).forEach(field => {
    if (hikeFieldType[field] === 'required' && !hike[field]) {
      errors.push(`Missing mandatory field: ${field}`);
    }
  });

  return (errors.length ? errors.join('; ') : null);
}

export default {
  validateHike,
  cleanupHike,
  convertHike,
};