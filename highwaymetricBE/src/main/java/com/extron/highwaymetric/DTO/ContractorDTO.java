package com.extron.highwaymetric.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContractorDTO {
    private String id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
