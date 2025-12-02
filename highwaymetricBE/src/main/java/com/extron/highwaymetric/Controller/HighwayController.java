package com.extron.highwaymetric.Controller;

import com.extron.highwaymetric.Model.Highway;
import com.extron.highwaymetric.Service.HighwayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.wololo.geojson.Feature;
import org.wololo.jts2geojson.GeoJSONWriter;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/highways")
public class HighwayController {

    private final HighwayService highwayService;
    private final GeoJSONWriter geoJSONWriter = new GeoJSONWriter();

    public HighwayController(HighwayService highwayService) {
        this.highwayService = highwayService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getHighwayAsGeoJson(@PathVariable String id) {
        Optional<Highway> highwayOptional = highwayService.findHighwayById(id);

        if (highwayOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Highway highway = highwayOptional.get();
        
        // Convert JTS Geometry to GeoJSON Geometry
        org.wololo.geojson.Geometry geoJsonGeometry = geoJSONWriter.write(highway.getGeom());

        // Create properties map
        Map<String, Object> properties = new HashMap<>();
        properties.put("name", highway.getName());
        properties.put("ref", highway.getRef());
        properties.put("status", highway.getStatus());

        // Create GeoJSON Feature
        Feature feature = new Feature(geoJsonGeometry, properties);

        // Use a simple map for the final JSON structure
        Map<String, Object> geoJsonOutput = new HashMap<>();
        geoJsonOutput.put("type", "FeatureCollection");
        geoJsonOutput.put("features", new Feature[]{feature});

        return ResponseEntity.ok(geoJsonOutput);
    }
}
