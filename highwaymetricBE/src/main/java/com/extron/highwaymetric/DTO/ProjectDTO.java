package com.extron.highwaymetric.DTO;

import java.util.List;

import com.extron.highwaymetric.Model.ProjectStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProjectDTO {

  @JsonProperty("name")
  private String projectName;

  @JsonProperty("highwayNo")
  private List<String> nhNumber;

  @JsonProperty("totalLength")
  private Double totalLength;

  @JsonProperty("Lanes")
  private String lanes;

  @JsonProperty("LOAdate")
  private String loaDate;
  
  @JsonProperty("StartDate")
  private String startDate;  
  
  @JsonProperty("State")
  private String state;
  
  @JsonProperty("status")
  private ProjectStatus status; 
 
  private List<String> highways; 

  private String newsArticle;

  @JsonProperty("Contractor")
  private String contractor;
}
