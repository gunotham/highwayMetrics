package com.extron.highwaymetric.Repository;

import com.extron.highwaymetric.Model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    Project findByProjectName(String projectName);

}
