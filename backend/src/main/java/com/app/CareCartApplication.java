package com.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan // This will scan for @WebServlet, @WebFilter annotations
public class CareCartApplication {
    public static void main(String[] args) {
        SpringApplication.run(CareCartApplication.class, args);
    }
}
