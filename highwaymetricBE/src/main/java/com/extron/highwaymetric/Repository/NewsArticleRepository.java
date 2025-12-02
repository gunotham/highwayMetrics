package com.extron.highwaymetric.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.extron.highwaymetric.Model.Highway;
import com.extron.highwaymetric.Model.NewsArticle;
import java.util.List;


public interface NewsArticleRepository extends JpaRepository<NewsArticle, String>{
    List<NewsArticle> findByHighway(Highway highway);

    List<NewsArticle> findByHighwayId(String highwayId);

    List<NewsArticle> findByHighwayOrderByPublishedAtDesc(Highway highway);

}
