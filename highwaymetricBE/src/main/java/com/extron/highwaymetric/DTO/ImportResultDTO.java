package com.extron.highwaymetric.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ImportResultDTO {
    private boolean success;
    private String message;
    private String highwayId;
}
