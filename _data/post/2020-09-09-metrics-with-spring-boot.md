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

> src/main/java/com/example/AdminApplication.java

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

# Add Discovery and Dockerize

In the example, we will build a Eureka Discovery server. Let's head over to https://start.spring.io/ again and add the dependency **Eureka Discovery Client**. Choose a **Maven** project type and use the Spring Boot version **2.3.3**. Import the project into SpringToolSuite or your favorite IDE. Call the artifact **Eureka** if you want to follow this example. Now add **@EnableEurekaServer** to the main method like this.

> src/main/java/com/example/EuekaApplication.java

```java
package com.example.eueka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class EuekaApplication {
	public static void main(String[] args) {
		SpringApplication.run(EuekaApplication.class, args);
	}
}
```

Now add these properties.

> src/main/resources/application.properties

```properties
eureka.client.registerWithEureka = false
eureka.client.fetchRegistry = false
server.port = 8761
```

That's all there is to it. We now have a Eureka discovery server.

Now we need to make some changes to the Admin Server and our simple test Web Application.

Let's start with the Admin Server by adding a dependency to the Eureka Client.

> pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.3.RELEASE</version>
		<relativePath />
	</parent>

	<groupId>com.example</groupId>
	<artifactId>Admin</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>Admin</name>
	<description>Spring Boot Admin</description>

	<properties>
		<java.version>11</java.version>
		<spring-boot-admin.version>2.3.0</spring-boot-admin.version>
		<spring-cloud.version>Hoxton.SR8</spring-cloud.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>de.codecentric</groupId>
			<artifactId>spring-boot-admin-starter-server</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
			<exclusions>
				<exclusion>
					<groupId>org.junit.vintage</groupId>
					<artifactId>junit-vintage-engine</artifactId>
				</exclusion>
			</exclusions>
		</dependency>
	</dependencies>

	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.springframework.cloud</groupId>
				<artifactId>spring-cloud-dependencies</artifactId>
				<version>${spring-cloud.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
			<dependency>
				<groupId>de.codecentric</groupId>
				<artifactId>spring-boot-admin-dependencies</artifactId>
				<version>${spring-boot-admin.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>
</project>
```

Now enable the Eureka client.

> src/main/java/com/example/AdminApplication.java

```java
package com.example.Admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

import de.codecentric.boot.admin.server.config.EnableAdminServer;

@EnableEurekaClient
@EnableAdminServer
@SpringBootApplication
public class AdminApplication {
	public static void main(String[] args) {
		SpringApplication.run(AdminApplication.class, args);
	}
}
```

And finally, update the application properties.

> src/main/java/com/example/AdminApplication.java

```properties
server.port: 8411
spring.application.name=adminServer
eureka.client.serviceUrl.defaultZone=http://${registry.host:localhost}:${registry.port:8761}/eureka/
management.endpoints.web.exposure.exclude=
management.endpoints.web.exposure.include=*
```

Moving on to our test WebApp, we need to make the same changes.

> pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.3.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>WebApp</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>WebApp</name>
	<description>Spring Boot Admin</description>

	<properties>
		<java.version>11</java.version>
		<spring-boot-admin.version>2.3.0</spring-boot-admin.version>
		<spring-cloud.version>Hoxton.SR8</spring-cloud.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-actuator</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>de.codecentric</groupId>
			<artifactId>spring-boot-admin-starter-client</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
			<exclusions>
				<exclusion>
					<groupId>org.junit.vintage</groupId>
					<artifactId>junit-vintage-engine</artifactId>
				</exclusion>
			</exclusions>
		</dependency>
	</dependencies>

	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.springframework.cloud</groupId>
				<artifactId>spring-cloud-dependencies</artifactId>
				<version>${spring-cloud.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
			<dependency>
				<groupId>de.codecentric</groupId>
				<artifactId>spring-boot-admin-dependencies</artifactId>
				<version>${spring-boot-admin.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

Now enable the Eureka client.

> src/main/java/com/example/WebAppApplication.java

```java
package com.example.WebApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@EnableEurekaClient
@SpringBootApplication
public class WebAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebAppApplication.class, args);
	}

}
```

And finally, update the application properties.

> src/main/java/com/example/AdminApplication.java

```properties
server.port: 9000
spring.application.name=sampleAdminClient
# Use a dirrerent port for acuator
management.server.port: 9001
# only allow local connections
# management.server.address: 127.0.0.1
management.endpoints.web.exposure.exclude=
management.endpoints.web.exposure.include=*
eureka.client.serviceUrl.defaultZone=http://${registry.host:localhost}:${registry.port:8761}/eureka/
```

# Dockerize

If you want to test it now, you could start all three servers but let's go one step further and Dockerize the servers to run them all with docker-compose.

If you checked out the source repository, it contains a multi-module pom with all three projects. You can use Maven to create docker images of all three projects like this.
Note: you should replace `jameskolean` with your docker hub ID.

```bash
 mvn -pl admin spring-boot:build-image -Dspring-boot.build-image.imageName=jameskolean/admin-spring-boot
mvn -pl eureka spring-boot:build-image -Dspring-boot.build-image.imageName=jameskolean/eureka
mvn -pl webapp spring-boot:build-image -Dspring-boot.build-image.imageName=jameskolean/admin-spring-boot-webapp-client
```

This step is not necessary, but you could push these to the docker hub. I'll push the latest to docker and make images public; these are the commands.

```bash
docker login
docker push jameskolean/eureka
docker push jameskolean/admin-client
docker push jameskolean/admin-spring-boot-webapp-client
```

I also pushed a version tagged image.

```bash
docker tag jameskolean/eureka jameskolean/eureka:0.1.0
docker tag jameskolean/admin-spring-boot jameskolean/admin-spring-boot:0.1.0
docker tag jameskolean/admin-spring-boot-webapp-client jameskolean/admin-spring-boot-webapp-client:0.1.0
docker push jameskolean/eureka:0.1.0
docker push jameskolean/admin-spring-boot:0.1.0
docker push jameskolean/admin-spring-boot-webapp-client:0.1.0
```

Create a docker-compose and run all three services.

> docker-compose.yml

```yml
version: '3'
services:
  eureka-serviceregistry:
    image: jameskolean/eureka
    container_name: eureka-1
    ports:
      - '8761:8761'
  admin:
    image: jameskolean/admin-spring-boot
    ports:
      - '8411:8411'
    environment:
      - eureka.client.serviceUrl.defaultZone=http://eureka-serviceregistry:8761/eureka
  webapp:
    image: jameskolean/admin-spring-boot-webapp-client
    container_name: webapp-1
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      - eureka.client.serviceUrl.defaultZone=http://eureka-serviceregistry:8761/eureka
```

Run it with this command.

```bash
docker-compose up
```

use Ctrl-C to stop or `docker-compose down`

## Test it

Browse to these URLs. It may take a minute for all the services to register, so be patient.

- Visit http://localhost:9000 for the WebApp REST endpoint
- Visit http://localhost:9001 for the WebApp Actuator endpoint
- Visit http://localhost:8441 for the Admin Server
- Visit http://localhost:8761 for the Eureka Server
