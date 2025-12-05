package com.extron.highwaymetric.Model;

import java.time.LocalDateTime;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "news_article")
@EntityListeners(AuditingEntityListener.class)
public class NewsArticle {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String title;

  @Column(name = "url", nullable = false, unique = true)
  private String url;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "highway_id", nullable = false)
  @JsonIgnore
  private Highway highway;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  @JsonIgnore
  private Project project;

  @Column(name = "published_at", nullable = false)
  private LocalDateTime publishedAt;

}
