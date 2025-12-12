package com.extron.highwaymetric.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.extron.highwaymetric.Model.Contractor;
import java.util.Optional;



public interface ContractorRepository extends JpaRepository<Contractor, String>{
    Optional<Contractor> findByName(String name);
}
