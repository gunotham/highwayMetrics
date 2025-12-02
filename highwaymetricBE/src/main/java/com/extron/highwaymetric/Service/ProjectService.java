package com.extron.highwaymetric.Service;

import com.extron.highwaymetric.DTO.ProjectDTO;
import com.extron.highwaymetric.Model.Project;
import com.extron.highwaymetric.Repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProjectDTO convertToDto(Project project) {
        String highwayId = (project.getHighway() != null) ? project.getHighway().getId() : null;
        String contractorName = (project.getHighway() != null && project.getHighway().getContractor() != null) 
                                ? project.getHighway().getContractor().getName() 
                                : null;

        return new ProjectDTO(
                project.getId(),
                project.getProjectName(),
                project.getNhNumber(),
                project.getTotalLength(),
                project.getLanes(),
                project.getConcessionaire(),
                project.getState(),
                project.getStatus() != null ? project.getStatus().toString() : null,
                project.getLoaDate(),
                highwayId,
                contractorName
        );
    }
}
