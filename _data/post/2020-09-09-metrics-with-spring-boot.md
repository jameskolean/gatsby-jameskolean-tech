---
template: BlogPost
date: 2020-09-09
published: true
title: Metrics with Spring Boot
source: https://gitlab.com/jameskolean/admin-spring-boot
tags:
  - Microservice
  - Docker
  - Java
  - Spring Boot
thumbnail: /assets/tape-measures-unsplash.jpg
---

When working with Microservices, you need a way to monitor your services. The cloud providers like AWS have their proprietary solutions, which may be perfectly fine. However, in this post, we will build a Spring Boot Admin Server to monitor Spring Boot and Python applications. (The Admin Server cal also provides notifications.) We will package the server into a docker image for easy deployment. Let's get started!

# Get started

Head over to https://start.spring.io/ and add the dependency **Codecentric's Spring Boot Admin (Server)**. Choose a **Maven** project type and use the Spring Boot version **2.3.3**. Import the project into SpringToolSuite or your favorite IDE. Call the artifact **Admin** if you want to follow this example. Now add **@EnableAdminServer** to the main method like this.

> src/main/java/com/example/Admin.java

```java
package com.example.Admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import de.codecentric.boot.admin.server.config.EnableAdminServer;

@EnableAdminServer
@SpringBootApplication
public class AdminApplication {
	public static void main(String[] args) {
		SpringApplication.run(AdminApplication.class, args);
	}
}
```

Let's run our application on a different port by setting this application property.

> src/main/resources/application.properties

```properties
server.port: 8411
```

## Test it out

Start it up and open a browser to http://localhost:8411. You will see the admin console.

# Dockerize

The quickest way to dockerize the application is to use Maven.

## Build

\*\*You will need to replace {yourDockerId} with your Docker ID and login with `docker login`

```bash
mvn spring-boot:build-image -Dspring-boot.build-image.imageName={yourDockerId}/admin-spring-boot
```

## Push it to Docker Hub

```bash
docker push {yourDockerId}/admin-spring-boot
```

## Push it to Docker Hub tagged with version.

**You will need to replace {version}**.

```bash
docker tag {yourDockerId}/admin-spring-boot {yourDockerId}/admin-spring-boot:{version}
docker push {yourDockerId}/admin-spring-boot:{version}
```

## Run it

```bash
docker run -p 8411:8411 -t {yourDockerId}/admin-spring-boot
```

## Test it out

Open a browser to http://localhost:8411. You will see the admin console.

# Secure it

Naturally, you will want to secure this endpoint in production. Don't forget this step.

# Create a simple Web Application to monitor.

Head over to https://start.spring.io/ and add the dependencies **Codecentric's Spring Boot Admin (Client)**, **Spring Web**, and **Spring Boot Actuator**. Choose a **Maven** project type and use the Spring Boot version **2.3.3**. Import the project into SpringToolSuite or your favorite IDE. Call the artifact **WebApp** if you want to follow this example.

Add a simple controller

> src/main/java/com/example/WebApp/RootComtroller.java

```java
package com.example.WebApp;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class RootController {
	@GetMapping("/")
	@ResponseBody
	public String helloWorld() {
		return "Hello World";
	}
}
```

Add some application properties.

> src/main/resources/applications.properties

```properties
server.port: 8080
# Use a dirrerent port for acuator
management.server.port: 8081
# only allow local connections
management.server.address: 127.0.0.1
management.endpoints.web.exposure.exclude=
management.endpoints.web.exposure.include=*
spring.boot.admin.client.url=http://localhost:8411
```

## Test it

Start our new WebApp application and our Admin application. The code from the repo uses a multi-module pom, so you will run them like this

```bash
mvn install
mvn spring-boot:run -pl admin
mvn spring-boot:run -pl webapp
```

- Visit http://localhost:9000 for the WebApp REST endpoint
- Visit http://localhost:9001 for the WebApp Actuator endpoint
- Visit http://localhost:8441 for the Admin Server

Note: I'm having issues connecting to the Dockerized Admin Application, so I'm skipping it for now. We should also secure the endpoints and adding a discovery service like Eureka.
