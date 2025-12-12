package com.extron.highwaymetric.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.extron.highwaymetric.Model.Highway;




public interface HighwayRepository extends JpaRepository<Highway, String>{
    Optional<Highway> findByHighwayNum(String highwayNum);
}
