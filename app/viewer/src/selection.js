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

export function computeWeightedRegionMembership(points, centerIndex, radiusMeters, transitionMeters = 0) {
  if (centerIndex < 0 || centerIndex >= points.length || radiusMeters < 0 || transitionMeters < 0) {
    return [];
  }

  const center = points[centerIndex];
  const outerRadius = radiusMeters + transitionMeters;
  return points
    .map((point, index) => {
      const distanceMeters = Math.sqrt(squaredDistance(point, center));
      let weight = 0;
      if (distanceMeters <= radiusMeters) {
        weight = 1;
      } else if (transitionMeters > 0 && distanceMeters <= outerRadius) {
        weight = 1 - (distanceMeters - radiusMeters) / transitionMeters;
      }
      return {
        index,
        distanceMeters,
        weight: Math.max(0, Math.min(1, weight)),
      };
    })
    .filter((node) => node.weight > 0)
    .sort((a, b) => a.distanceMeters - b.distanceMeters || a.index - b.index);
}

export function mergeWeightedRegions(existingRegion, nextRegion, mode = "replace") {
  if (mode !== "expand") {
    return [...nextRegion];
  }

  const merged = new Map();
  existingRegion.forEach((node) => merged.set(node.index, { ...node }));
  nextRegion.forEach((node) => {
    const existing = merged.get(node.index);
    merged.set(node.index, existing && existing.weight >= node.weight ? existing : { ...node });
  });

  return [...merged.values()].sort((a, b) => b.weight - a.weight || a.distanceMeters - b.distanceMeters || a.index - b.index);
}
