package com.extron.highwaymetric.Model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.locationtech.jts.geom.Geometry;


@Entity
@Table(name = "highway")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Highway {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String ref;
    private String description;
    
    @Enumerated(EnumType.STRING)
    private HighwayStatus status = HighwayStatus.PLANNING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id")
    @JsonManagedReference
    private Contractor contractor;

    @OneToMany(mappedBy = "highway", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
     private List<NewsArticle> news;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
     private LocalDateTime createdAt;
     
    @LastModifiedDate
    @Column(name = "updated_at")
     private LocalDateTime updatedAt;
     
     @Column(name = "estimated_budget")
     private Double estimatedBudget;
     
     @Column(name = "actual_cost")
     private Double actualCost;
     
     @Column(name = "rework_count")
     private Integer reworkCount = 0;
     
     @Column(name = "completion_date")
     private LocalDateTime completionDate;
     
     @Column(name = "length_km")
     private Double lengthKm;
     
     @Column(name = "state")
     private String state;

     @Column(name = "geom", columnDefinition = "geometry(Geometry,4326)")
     private Geometry geom;
    
}
