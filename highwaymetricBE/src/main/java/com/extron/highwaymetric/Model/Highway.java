package com.extron.highwaymetric.Model;

import java.util.List;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "highway")
public class Highway {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String highwayNum;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "highway_project", joinColumns = @JoinColumn(name = "highway_id"), inverseJoinColumns = @JoinColumn(name = "project_id"))
  private List<Project> projects;

  @OneToMany(mappedBy = "highway", fetch = FetchType.LAZY)
  private List<NewsArticle> articles;

  private String totalBudget;
  private String highwayDistance;
}
