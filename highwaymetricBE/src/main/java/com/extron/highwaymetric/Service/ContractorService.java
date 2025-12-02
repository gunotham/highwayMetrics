package com.extron.highwaymetric.Service;

import com.extron.highwaymetric.DTO.ContractorDTO;
import com.extron.highwaymetric.Model.Contractor;
import com.extron.highwaymetric.Repository.ContractorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContractorService {

    private final ContractorRepository contractorRepository;

    public ContractorService(ContractorRepository contractorRepository) {
        this.contractorRepository = contractorRepository;
    }

    public ContractorDTO createContractor(ContractorDTO contractorDTO) {
        Contractor contractor = new Contractor();
        contractor.setName(contractorDTO.getName());
        contractor.setDescription(contractorDTO.getDescription());
        Contractor savedContractor = contractorRepository.save(contractor);
        return toDTO(savedContractor);
    }

    public List<ContractorDTO> getAllContractors() {
        return contractorRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ContractorDTO> getContractorById(String id) {
        return contractorRepository.findById(id).map(this::toDTO);
    }

    public Optional<ContractorDTO> updateContractor(String id, ContractorDTO contractorDTO) {
        return contractorRepository.findById(id).map(existingContractor -> {
            existingContractor.setName(contractorDTO.getName());
            existingContractor.setDescription(contractorDTO.getDescription());
            Contractor updatedContractor = contractorRepository.save(existingContractor);
            return toDTO(updatedContractor);
        });
    }

    public boolean deleteContractor(String id) {
        if (contractorRepository.existsById(id)) {
            contractorRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private ContractorDTO toDTO(Contractor contractor) {
        ContractorDTO dto = new ContractorDTO();
        dto.setId(contractor.getId());
        dto.setName(contractor.getName());
        dto.setDescription(contractor.getDescription());
        dto.setCreatedAt(contractor.getCreatedAt());
        dto.setUpdatedAt(contractor.getUpdatedAt());
        return dto;
    }
}
