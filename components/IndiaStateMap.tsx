import { indiaRegions } from "@/lib/discovery";
import { examsForRegion } from "@/lib/exams";
import mapData from "@/data/geo/india-state-paths.json";

export function IndiaStateMap() {
  const regionByMapName = new Map(indiaRegions.map((region) => [region.mapName, region]));
  const countByCode = new Map(
    indiaRegions.map((region) => [region.code, examsForRegion(region.code).length]),
  );

  return (
    <div className="india-map-wrap">
      <svg
        viewBox={`0 0 ${mapData.width} ${mapData.height}`}
        role="img"
        aria-labelledby="india-map-title india-map-description"
        className="india-map"
      >
        <title id="india-map-title">Browse government exams by Indian state or union territory</title>
        <desc id="india-map-description">Each state and union territory is a link. A text directory is available beside the map.</desc>
        {mapData.shapes.map((shape) => {
          const region = regionByMapName.get(shape.name);
          if (!region) return <path d={shape.d} className="map-shape map-shape-muted" key={shape.name} />;
          const count = countByCode.get(region.code) ?? 0;
          const intensity = Math.min(count, 3);
          const label = `${region.name}: ${count ? `${count} explicitly tagged recruitment ${count === 1 ? "cycle" : "cycles"}` : "no state-specific cycle in the index"}`;

          return (
            <a href={`/states/${region.slug}`} aria-label={label} className="map-link" key={region.code}>
              <title>{label}</title>
              <path d={shape.d} className={`map-shape map-intensity-${intensity}`} />
            </a>
          );
        })}
      </svg>
      <div className="map-legend" aria-label="Map legend">
        <span><i className="map-legend-empty" />No state cycle yet</span>
        <span><i className="map-legend-active" />Cycles in index</span>
      </div>
    </div>
  );
}
