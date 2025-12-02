package com.extron.highwaymetric.Service;

import com.extron.highwaymetric.Model.Highway;
import com.extron.highwaymetric.Repository.HighwayRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class HighwayService {

    private final HighwayRepository highwayRepository;

    public HighwayService(HighwayRepository highwayRepository) {
        this.highwayRepository = highwayRepository;
    }

    public Optional<Highway> findHighwayById(String id) {
        return highwayRepository.findById(id);
    }
}
