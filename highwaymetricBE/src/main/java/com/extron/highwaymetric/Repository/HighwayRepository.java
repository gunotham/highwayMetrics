package com.extron.highwaymetric.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.extron.highwaymetric.Model.Highway;
import com.extron.highwaymetric.Model.HighwayStatus;


public interface HighwayRepository extends JpaRepository<Highway, String>{
    
    Page<Highway> findByStatus(HighwayStatus status, Pageable pageable);

    List<Highway> findByState(String state);

    Optional<Highway> findByRef(String ref);
    
    List<Highway> findByNameContainingIgnoreCase(String name);

    @Query("SELECT h FROM Highway h LEFT JOIN FETCH h.contractor WHERE h.status = :status")
    List<Highway> findByStatusWithContractor(@Param("status") HighwayStatus status);

    Page<Highway> findByStatusOrState(HighwayStatus status, String state, Pageable pageable);

    @Query("SELECT h FROM Highway h WHERE h.geom IS NOT NULL")
    List<Highway> findAllWithGeom();


}
