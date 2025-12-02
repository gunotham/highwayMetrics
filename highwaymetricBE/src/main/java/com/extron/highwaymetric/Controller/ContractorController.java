package com.extron.highwaymetric.Controller;

import com.extron.highwaymetric.DTO.ContractorDTO;
import com.extron.highwaymetric.Service.ContractorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contractors")
public class ContractorController {

    private final ContractorService contractorService;

    public ContractorController(ContractorService contractorService) {
        this.contractorService = contractorService;
    }

    @PostMapping
    public ContractorDTO createContractor(@RequestBody ContractorDTO contractorDTO) {
        return contractorService.createContractor(contractorDTO);
    }

    @GetMapping
    public List<ContractorDTO> getAllContractors() {
        return contractorService.getAllContractors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractorDTO> getContractorById(@PathVariable String id) {
        return contractorService.getContractorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractorDTO> updateContractor(@PathVariable String id, @RequestBody ContractorDTO contractorDTO) {
        return contractorService.updateContractor(id, contractorDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContractor(@PathVariable String id) {
        if (contractorService.deleteContractor(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
