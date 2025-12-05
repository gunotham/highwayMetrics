package com.extron.highwaymetric.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.extron.highwaymetric.Model.NewsArticle;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, String>{
}
