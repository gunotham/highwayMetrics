package com.extron.highwaymetric.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.MultiLineString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "project")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Project {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String projectName;
  private Double totalLength;
  private String lanes;
  private String state;

  @JdbcTypeCode(SqlTypes.GEOMETRY)
  @Column(name = "geom")
  private MultiLineString geom;

  @Enumerated(EnumType.STRING)
  private ProjectStatus status;

  private LocalDate loaDate;

  private LocalDate startDate;

  @ManyToMany( mappedBy = "projects", fetch = FetchType.LAZY)
  private List<Highway> highways;

  @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
  private List<NewsArticle> news_articles;

  @ManyToOne
  @JoinColumn(name = "contractor_id")
  private Contractor contractor;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

}
