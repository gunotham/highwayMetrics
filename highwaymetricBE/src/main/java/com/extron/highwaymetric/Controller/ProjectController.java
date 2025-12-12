package com.extron.highwaymetric.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.extron.highwaymetric.DTO.ProjectDTO;
import com.extron.highwaymetric.Service.ProjectService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("api/projects")
public class ProjectController {

    private ProjectService projectService;
    
    public ProjectController(ProjectService projectService){
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<String> addNewProject(@RequestBody ProjectDTO projectDTO) {
        try {
            String result = projectService.addNewProject(projectDTO);
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An internal error occured: "+ e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return new ResponseEntity<>(projectService.getAllProjects(), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeProject(@PathVariable String id){
        return new ResponseEntity<>(projectService.removeProject(id), HttpStatus.OK);
    }
    
    
}
