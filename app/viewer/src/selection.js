export function squaredDistance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

export function findNearestPointIndex(points, target) {
  if (!points.length) {
    return -1;
  }

  let nearestIndex = 0;
  let nearestDistance = squaredDistance(points[0], target);
  for (let index = 1; index < points.length; index += 1) {
    const distance = squaredDistance(points[index], target);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }
  return nearestIndex;
}

export function computeRegionMembership(points, centerIndex, radiusMeters) {
  if (centerIndex < 0 || centerIndex >= points.length || radiusMeters < 0) {
    return [];
  }

  const center = points[centerIndex];
  return points
    .map((point, index) => ({
      index,
      distanceMeters: Math.sqrt(squaredDistance(point, center)),
    }))
    .filter((node) => node.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters || a.index - b.index);
}
