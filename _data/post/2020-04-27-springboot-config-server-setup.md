---
template: BlogPost
date: 2020-04-27T13:59:29.555Z
title: 'Setting up a Springboot Configuration Server'
tags:
  - SpringBoot
  - Java
source: https://gitlab.com/jameskolean/springboot-config-server-demo/-/tree/master
thumbnail: /assets/connections-unsplash.jpg
---

# Under construction

Still building the example. Please check back later...
Contents

# Basic Setup

The basic setup covers getting two servers up and running; the Configuration Server and the Configuration Consumer Application. We will get things up and running then iterate on the solution with additional features.

## Configuration Server

Start by going over to [start.spring.io](https://start.spring.io/) and create a project with the Config Server dependency. The pom.xml should look like this.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.2.6.RELEASE</version>
		<relativePath /> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.codegreenllc.spring</groupId>
	<artifactId>config-server</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>config-server</name>
	<description>Spring Boot Configuration server</description>

	<properties>
		<java.version>1.8</java.version>
		<spring-cloud.version>Hoxton.SR4</spring-cloud.version>
		<jib.version>2.2.0</jib.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-config-server</artifactId>
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

<p>&nbsp</p>
Now update your Application.java class to enable the configuration server like this.

```java
package com.codegreenllc.spring.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@EnableConfigServer
@SpringBootApplication
public class Application {
	public static void main(final String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
```

<p>&nbsp</p>
Edit <b>src/main/resources/application.properties</b> to start on a non-conflicting port and indicate where to fing the properties.

```properties
server.port=8888
spring.cloud.config.server.git.uri=https://gitlab.com/jameskolean/springboot-config-demo-repo.git
```

<p>&nbsp</p>
In this case I point <b>spring.cloud.config.server.git.uri</b> to a public repository containing a single file <b>config-consumer-app.properties</b> containing one line.

```properties
message=Hello world
```

<p>&nbsp</p>
You can instead create a local repository like this.

```shell
mkdir my-repo
cd my-repo
git init
echo "message=Hello world" > config-consumer-app.properties
git add .
git commit -m "Added properties"
```

<p>&nbsp</p>
Now change <b>spring.cloud.config.server.git.uri</b> to the fully qualified path to <b>my-repo</b>.

Start it and test it.

```shell
mvn spring-boot:run
```

```shell
curl http://localhost:8888/config-consumer-app/default

{"name":"config-consumer-app","profiles":["default"],"label":null,"version":"b1b2a823a0231d324be902c82e696ece85639c86","state":null,"propertySources":[{"name":"https://gitlab.com/jameskolean/springboot-config-demo-repo.git/config-consumer-app.properties","source":{"message":"Hello world"}}]}%
```

Great, now we can serve up configurations.

## Configuration Consumer Application

Let's create a simple Web Application that will use properties from our Configuration Serve we just started. Start by going over to [start.spring.io](https://start.spring.io/) and create a project with the Spring Web, Actuator, DevTools, and Config Client dependencies. The pom.xml file should look like this.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.2.6.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.codegreenllc</groupId>
	<artifactId>config-consumer-app</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>config-consumer-app</name>
	<description>Sample Springboot application that uses our Configuration Server</description>

	<properties>
		<java.version>1.8</java.version>
		<spring-cloud.version>Hoxton.SR4</spring-cloud.version>
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
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-starter-config</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
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

<p>&nbsp</p>
Let's add a simple controller in <b>Application.java</b> to echo back the configuration property.

```java
package com.codegreenllc.configconsumerapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class Application {

    @RefreshScope
    @RestController
    class MessageRestController {

        @Value("${message:Hello default}")
        private String message;

        @RequestMapping("/message")
        String getMessage() {
            return this.message;
        }
    }

    public static void main(final String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

<p>&nbsp</p>
We need to add some properties that are set before the normal configuration phase. To do this create a file called <b>src/main/resources/bootstrap.properties</b>.

```properties
spring.application.name=config-consumer-app
spring.cloud.config.uri=http://localhost:8888
```

<p>&nbsp</p>
Now turn on Actuator by adding this line to <b>src/main/resources/application.properties</b>.

```properties
management.endpoints.web.exposure.include=*
```

<p>&nbsp</p>
Run it

```shell
mvn spring-boot:run
```

<p>&nbsp</p>
Open a browser to <a href="http://localhost:8080/message">http://localhost:8080/message</a>
<p>&nbsp</p>
Now you can change the message property in 'my-repo' git repository. We can trigger our Web Application to pull the new value with this command.

```shell
curl localhost:8080/actuator/refresh -d {} -H "Content-Type: application/json"
```

<p>&nbsp</p>

# Dockerize

Edit the Configuration Server <b>pom.xml</b> file. We are adding the JIB build plugin to build the image and publish it to docker hub.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.2.6.RELEASE</version>
		<relativePath /> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.codegreenllc.spring</groupId>
	<artifactId>config-server</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>config-server</name>
	<description>Spring Boot Configuration server</description>

	<properties>
		<java.version>1.8</java.version>
		<spring-cloud.version>Hoxton.SR4</spring-cloud.version>
		<jib.version>2.2.0</jib.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-config-server</artifactId>
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
		</dependencies>
	</dependencyManagement>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
			<plugin>
				<groupId>com.google.cloud.tools</groupId>
				<artifactId>jib-maven-plugin</artifactId>
				<version>${jib.version}</version>
				<configuration>
					<from>
						<image>openjdk:8u222-jre</image>
					</from>
					<to>
						<image>docker.io/jameskolean/${project.name}:${project.version}</image>
					</to>
					<container>
						<ports>
							<port>8888</port>
						</ports>
						<user>1025</user>
						<environment>
							<SPRING_OUTPUT_ANSI_ENABLED>ALWAYS</SPRING_OUTPUT_ANSI_ENABLED>
						</environment>
						<creationTime>USE_CURRENT_TIMESTAMP</creationTime>
					</container>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>
```

<p>&nbsp</p>
If you want to run this, you will need to point to your docker repository and sign into docker hub. At that point these commands will build, publish, pull, and run the dockerized Configuration Server.

```shell
mvn clean package jib:build
docker pull jameskolean/config-server:0.0.1-SNAPSHOT
docker run -p 8888:8888 -t "jameskolean/config-server:0.0.1-SNAPSHOT"
```

<p>&nbsp</p>
 Now test with curl like we did before.

```shell
curl http://localhost:8888/config-consumer-app/default

{"name":"config-consumer-app","profiles":["default"],"label":null,"version":"b1b2a823a0231d324be902c82e696ece85639c86","state":null,"propertySources":[{"name":"https://gitlab.com/jameskolean/springboot-config-demo-repo.git/config-consumer-app.properties","source":{"message":"Hello world"}}]}%
```

<p>&nbsp</p>
Great, Let's do the same for the Web Application starting with the file <b>pom.xml</b>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.2.6.RELEASE</version>
		<relativePath /> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.codegreenllc</groupId>
	<artifactId>config-consumer-app</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>config-consumer-app</name>
	<description>Sample Springboot application that uses our Configuration Server</description>

	<properties>
		<java.version>1.8</java.version>
		<spring-cloud.version>Hoxton.SR4</spring-cloud.version>
		<jib.version>2.2.0</jib.version>
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
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-starter-config</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
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
		</dependencies>
	</dependencyManagement>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
			<plugin>
				<groupId>com.google.cloud.tools</groupId>
				<artifactId>jib-maven-plugin</artifactId>
				<version>${jib.version}</version>
				<configuration>
					<from>
						<image>openjdk:8u222-jre</image>
					</from>
					<to>
						<image>docker.io/jameskolean/${project.name}:${project.version}</image>
					</to>
					<container>
						<ports>
							<port>8080</port>
						</ports>
						<user>1025</user>
						<environment>
							<SPRING_OUTPUT_ANSI_ENABLED>ALWAYS</SPRING_OUTPUT_ANSI_ENABLED>
						</environment>
						<creationTime>USE_CURRENT_TIMESTAMP</creationTime>
					</container>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>
```

<p>&nbsp</p>
On Macs you should edit the file called <b>src/main/resources/bootstrap.properties</b>.

```properties
spring.application.name=config-consumer-app
spring.cloud.config.uri=http://host.docker.internal:8888
```

<p>&nbsp</p>
Now build and run it.

```shell
mvn -DskipTests package jib:build
docker pull jameskolean/config-consumer-app:0.0.1-SNAPSHOT
docker run -p 8080:8080 -t "jameskolean/config-consumer-app:0.0.1-SNAPSHOT"
```

<p>&nbsp</p>
Test it out at <a href="http://localhost:8080/message">http://localhost:8080/message</a>
<p>&nbsp</p>

# Secure our GitLab repository

This can be done in three easy steps

1. Change the ptoject to Private at Settings > General > Visibility
2. Create a deploy token at Settings > Repository > Reploy Tokens
3. Edit /src/main/resources/applicatio.properties

```properties
server.port=8888
spring.cloud.config.server.git.uri=https://gitlab.com/jameskolean/springboot-config-demo-repo.git
spring.cloud.config.server.git.username=gitlab+deploy-token-166598
spring.cloud.config.server.git.password=YOUR-DEPLOY-TOKEN-PASSWORD
```
