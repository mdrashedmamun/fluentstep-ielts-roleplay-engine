/**
 * Organic Path Generator Service
 * Generates hand-drawn, organic-looking paths instead of mathematical sine waves
 * Uses seeded randomness for consistent but natural-looking paths
 */

export interface PathPoint {
  x: number;
  y: number;
  wobble: number;
}

/**
 * Generate organic path points with natural wobble and curves
 * Uses seeded randomness for consistency across renders
 */
export function generateOrganicPath(
  scenarioCount: number,
  viewBoxWidth: number = 1000,
  viewBoxHeight: number = 1400
): PathPoint[] {
  const points: PathPoint[] = [];

  for (let i = 0; i < scenarioCount; i++) {
    const progress = scenarioCount > 1 ? i / (scenarioCount - 1) : 0;

    // Base progression (left to right, bottom to top)
    const baseX = 80 + progress * 840;
    const baseY = viewBoxHeight - 120 - progress * (viewBoxHeight - 240);

    // Seeded randomness for consistent organic wobble
    // Using multiple seed values to create more natural variation
    const seed1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const seed2 = Math.cos(i * 45.164 + 94.673) * 23421.6314;
    const seed3 = Math.sin(i * 94.673 + 12.9898) * 34231.7821;

    const wobbleX = ((seed1 - Math.floor(seed1)) * 2 - 1) * 50;
    const wobbleY = ((seed2 - Math.floor(seed2)) * 2 - 1) * 30;

    // Natural switchback curves - creates organic left-right movement
    const curveFactor = Math.sin(progress * Math.PI * 2.5 + i * 0.5) * 100;

    // Extra variation for terrain texture
    const terrainWiggle = ((seed3 - Math.floor(seed3)) * 2 - 1) * 20;

    const x = Math.max(
      60,
      Math.min(viewBoxWidth - 60, baseX + curveFactor + wobbleX + terrainWiggle)
    );
    const y = Math.max(60, Math.min(viewBoxHeight - 60, baseY + wobbleY));

    points.push({
      x,
      y,
      wobble: wobbleX
    });
  }

  return points;
}

/**
 * Generate smooth SVG path string using Catmull-Rom spline interpolation
 * Creates beautiful, organic curves through the waypoints
 */
export function generateSmoothPathD(points: PathPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let pathD = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    // Get control points using Catmull-Rom spline
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Calculate control points for smooth curves
    // The 1/6 factor creates natural-looking curves
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    // Create cubic Bézier curve to next point
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return pathD;
}

/**
 * Generate path for completed journey (animated from start to current progress)
 */
export function generateCompletedPathD(
  points: PathPoint[],
  completionPercentage: number
): string {
  if (points.length === 0) return '';

  // Calculate how many points should be included based on completion
  const completedPointCount = Math.ceil(
    (completionPercentage / 100) * points.length
  );
  const completedPoints = points.slice(0, Math.max(1, completedPointCount));

  return generateSmoothPathD(completedPoints);
}
