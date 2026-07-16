package com.neha.VideoStreamApp;

import com.neha.VideoStreamApp.services.VideoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class VideoStreamAppApplicationTests {

	@Autowired
	VideoService videoService;

	@Test
	void contextLoads() {
	}

}
