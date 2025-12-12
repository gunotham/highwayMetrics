package com.extron.highwaymetric.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.extron.highwaymetric.DTO.ProjectDTO;
import com.extron.highwaymetric.Model.Contractor;
import com.extron.highwaymetric.Model.Highway;
import com.extron.highwaymetric.Model.Project;
import com.extron.highwaymetric.Repository.ContractorRepository;
import com.extron.highwaymetric.Repository.HighwayRepository;
import com.extron.highwaymetric.Repository.ProjectRepository;

@Service
public class ProjectService {

    final private ProjectRepository projectRepo;
    final private ContractorRepository contractorRepo;
    final private HighwayRepository highwayRepo;

    public ProjectService(ProjectRepository projectRepository, ContractorRepository contractorRepository, HighwayRepository highwayRepository){
        this.projectRepo = projectRepository;
        this.contractorRepo = contractorRepository;
        this.highwayRepo = highwayRepository;
    }

    public String addNewProject(ProjectDTO projectDTO) {

        Project proj = projectRepo.findByProjectName(projectDTO.getProjectName());
        if (proj != null){
            throw new RuntimeException("Project already exists with ID: " + proj.getId());
        }

        Project newProject = new Project();

        newProject.setProjectName(projectDTO.getProjectName());
        newProject.setLanes(projectDTO.getLanes());
        newProject.setTotalLength(projectDTO.getTotalLength());
        newProject.setState(projectDTO.getState());
        newProject.setStatus(projectDTO.getStatus());

        Contractor contractor = contractorRepo.findByName(projectDTO.getContractor())
        .orElseGet(() ->{
            Contractor newC = new Contractor();
            newC.setName(projectDTO.getContractor());
            return contractorRepo.save(newC);
        });

        newProject.setContractor(contractor);

        List<Highway> projectHighways = new ArrayList<>();
       
        List<String> highwayNums = projectDTO.getNhNumber();

        if (highwayNums != null) {
            for(String num : highwayNums){
                if(num != null && !num.isBlank()){
                    Highway highway = highwayRepo.findByHighwayNum(num).
                    orElseGet(() ->{
                        Highway newH = new Highway();
                        newH.setHighwayNum(num);
                        return highwayRepo.save(newH);
                    });
                    projectHighways.add(highway);
                }
            }
        }

        newProject.setHighways(projectHighways);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        if(projectDTO.getLoaDate() != null && !projectDTO.getLoaDate().isEmpty()){
            try{
                LocalDate date = LocalDate.parse(projectDTO.getLoaDate(), formatter);
                newProject.setLoaDate(date);
            } catch(DateTimeParseException e){
                throw new RuntimeException("Invalid LOA date format for project: " + projectDTO.getProjectName() + ". Expected dd/MM/yyyy");
            }
        }

        if(projectDTO.getStartDate() != null && !projectDTO.getStartDate().isEmpty()){
            try{
                LocalDate date = LocalDate.parse(projectDTO.getStartDate(), formatter);
                newProject.setStartDate(date);
            } catch(DateTimeParseException e){
                throw new RuntimeException("Invalid Start Date format for project: " + projectDTO.getProjectName() + ". Expected dd/MM/yyyy");
            }
        }
        
        projectRepo.save(newProject);
        return "Project created successfully with ID: " + newProject.getId();

    }

    public List<ProjectDTO> getAllProjects() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllProjects'");
    }

    public String removeProject(String id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'removeProject'");
    }

 

}
