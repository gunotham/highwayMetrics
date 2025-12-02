package com.extron.highwaymetric.DTO;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private String id;
    private String projectName;
    private String nhNumber;
    private Double totalLength;
    private String lanes;
    private String concessionaire;
    private String state;
    private String status;
    private LocalDate loaDate;
    private String highwayId;
    private String contractorName;
}
