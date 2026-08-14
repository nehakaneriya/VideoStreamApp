package com.neha.VideoStreamApp.services;

import com.neha.VideoStreamApp.dtos.response.CategoryDto;

import java.util.List;
import java.util.Map;

public interface CategoryService {

    List<CategoryDto> getAllCategories();

    CategoryDto createCategory(String name, String description);

    Map<String, Object> deleteCategory(String id);
}
