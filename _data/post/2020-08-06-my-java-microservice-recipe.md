---
template: BlogPost
date: 2020-08-06T19:26:26.345Z
published: true
title: My Java Microservice Recipe
source: 'https://gitlab.com/jameskolean/microservice-recipe-java'
tags:
  - GraphQL
  - Java
  - REST
  - Docker
  - Microservice
  - Spring Boot
thumbnail: /assets/coffee-and-beans-unsplash.jpg
---

This is my recipe for a Microservice.

Ingredients:

- [Java SpringBoot](#springboot)
  - DevTools
  - Lombok
- [Database](#database)
- [Presistence](#persistence)
- API
  - [REST](#rest)
  - [GraphQL](#graphql)
- [JMS](#messaging)
  - [Kafka in Docker](#kafka)
  - [Producer / Consumer](#producer-consumer)
- [Monitoring](#monitoring)
- [Tracing](#tracing)
- [Configuration](#configuration)

Directions:

<div id="springboot"><h1>Add Springboot</h1></div>

Go to https://start.spring.io/ and add dependencies:

- Spring Boot DevTools
- Lombok
- SpringConfigurationPrecessor
- Spring Web
- Spring Data JPA
- H2 Database
- Spring for Apache Kafka
- Liquibase Migration

<div id="database"><h1>Stir in Database</h1></div>

You can use any RDBMS or even a NoSQL option. For simplicity, I'm mixing in H2 and bootstrapping with some test data. I use Liquibase to ensure the code and database are synchronized automatically.

> /src/main/resources/application.properties

```
spring.datasource.url=jdbc:h2:mem:testdb
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml
```

> /src/main/resources/db.changelog/db.changelog-master.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
	http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.0.xsd">
	<include file="0.1/db.changelog.xml" relativeToChangelogFile="true" />
 </databaseChangeLog>
```

> /src/main/resources/db.changelog/0.1/db.changelog.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
	xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
     http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.0.xsd">
	<property name="now" value="CURRENT_TIME()" dbms="h2" />

	<changeSet id="createTodo" author="jkolean">
		<createTable tableName="TODO">
			<column name="ID" type="uuid" remarks="Primary identifier">
				<constraints primaryKey="true" />
			</column>
			<column name="VERSION" type="integer" defaultValue="0"
				remarks="JPA managed optomistic locking sequence">
				<constraints nullable="false" />
			</column>
			<column name="CREATED_BY" type="varchar(64)"
				defaultValue="unset" remarks="User that created this row">
				<constraints nullable="false" />
			</column>
			<column name="CREATED_DATE" type="datetime"
				remarks="Row creation timestamp">
				<constraints nullable="false" />
			</column>
			<column name="LAST_MODIFIED_BY" type="varchar(64)"
				defaultValue="unset" remarks="User that last modified this row">
				<constraints nullable="false" />
			</column>
			<column name="LAST_MODIFIED_DATE" type="datetime"
				remarks="Timestamp of last modification to this row">
				<constraints nullable="false" />
			</column>
			<column name="DESCRIPTION" type="varchar(35)"
				remarks="A string description the todo.">
				<constraints nullable="false" />
			</column>
			<column name="COMPLETED" type="boolean" defaultValue="false"
				remarks="Boolean indicating if the Todo has been marked as completed. If this value is true then the Todo has been marked as completed">
				<constraints nullable="false" />
			</column>
		</createTable>
	</changeSet>

	<changeSet id="augmentTodoH2" author="jkolean" dbms="h2">
		<addDefaultValue tableName="TODO"
			columnName="CREATED_DATE" columnDataType="date"
			defaultValueDate="${now}" />
		<addDefaultValue tableName="TODO"
			columnName="LAST_MODIFIED_DATE" columnDataType="date"
			defaultValueDate="${now}" />
		<rollback>
			<dropDefaultValue tableName="TODO"
				columnName="CREATED_DATE" />
			<dropDefaultValue tableName="TODO"
				columnName="LAST_MODIFIED_DATE" />
		</rollback>
	</changeSet>

	<changeSet id="loadTodoTestData" author="jkolean">
		<comment>Load three todos for initial testing</comment>
		<loadData encoding="UTF-8" tableName="TODO"
			file="db/changelog/0.1/todos.csv">
			<column name="id" type="uuid" />
		</loadData>

		<rollback>
			<delete tableName="TODO">
				<whereParams>
					<param name="id" value="00000000-0000-0000-0000-000000000001" />
				</whereParams>
			</delete>
			<delete tableName="TODO">
				<whereParams>
					<param name="id" value="00000000-0000-0000-0000-000000000002" />
				</whereParams>
			</delete>
			<delete tableName="TODO">
				<whereParams>
					<param name="id" value="00000000-0000-0000-0000-000000000003" />
				</whereParams>
			</delete>
		</rollback>
	</changeSet>
</databaseChangeLog>
```

> /src/main/resources/db.changelog/0.1/todos.csv

```
ID,DESCRIPTION,COMPLETED
"00000000-0000-0000-0000-000000000001","Do the thing", false
"00000000-0000-0000-0000-000000000002","Pickup the stuff", false
"00000000-0000-0000-0000-000000000003","Meet with Team",true
```

## Test it

Launch the application and check the database at http://localhost:8080/h2-console

```properties
Driver Class: org.h2.Driver
JDBC URL: jdbc:h2:mem:testdb
User Name: sa
Password: <leave blank>
```

<div id="rest"><h1>Stir in a REST API</h1></div>

We will need a DTO (Data Transfer Object) that will be serialized into JSON and sent to the client by the Controller. We will also add swagger so the clients can discover and test the REST endpoint.

> src/main/java/com/codegreenllc/microservice/recipe/dto/TodoDto.java

```java
package com.codegreenllc.microservice.recipe.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoDto {
	private boolean completed;
	private String description;
	private UUID id;
	private Long version;
}
```

> src/main/java/com/codegreenllc/microservice/recipe/controller/TodoController.java

````java
package com.codegreenllc.microservice.recipe.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.codegreenllc.microservice.recipe.dto.TodoDto;

@RestController
public class TodoController {
	@RequestMapping("/v1/todo")
	public List<TodoDto> getAllTodos() {
		final List<TodoDto> result = new ArrayList<>();
	result.add(TodoDto.builder().id(UUID.randomUUID()).version(0L).description("Do domething").completed(false)
				.build());
		return result;
	}
}```

> src/main/java/com/codegreenllc/microservice/recipe/SwaggerConfig.java
```java
package com.codegreenllc.microservice.recipe;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SwaggerConfig {
	@Bean
	public Docket api() {
		return new Docket(DocumentationType.SWAGGER_2).select().apis(RequestHandlerSelectors.any())
				.paths(PathSelectors.any()).build();
	}
}}
````

> /pom.xml

```xml
...
	<dependencies>
...
		<dependency>
			<groupId>io.springfox</groupId>
			<artifactId>springfox-swagger2</artifactId>
			<version>2.9.2</version>
		</dependency>
		<dependency>
			<groupId>io.springfox</groupId>
			<artifactId>springfox-swagger-ui</artifactId>
			<version>2.9.2</version>
		</dependency>
...
	</dependencies>
...
```

## Test it

Go to http://localhost:8080/swagger-ui.html

<div id="persistence"><h1>Add some persistence</h1></div>

We are going to need several layers for this. We will change the Controller to call a Service that provides the business logic and a transactional scope. The Service could call other Services, but it will only call a repository in this example. We will need an Entity that maps the data between Java and the database. To keep the Entities clean, we will also add a custom physical database naming strategy. Let's get to it.

> src/main/java/com/codegreenllc/microservice/recipe/config/jpa/CustomPhysicalNamingStrategy.java

```java
package com.codegreenllc.microservice.recipe.config.jpa;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class CustomPhysicalNamingStrategy implements PhysicalNamingStrategy {
	@Override
	public Identifier toPhysicalCatalogName(Identifier identifier, JdbcEnvironment jdbcEnv) {
		return convert(identifier);
	}
	@Override
	public Identifier toPhysicalColumnName(Identifier identifier, JdbcEnvironment jdbcEnv) {
		return convert(identifier);
	}
	@Override
	public Identifier toPhysicalSchemaName(Identifier identifier, JdbcEnvironment jdbcEnv) {
		return convert(identifier);
	}
	@Override
	public Identifier toPhysicalSequenceName(Identifier identifier, JdbcEnvironment jdbcEnv) {
		return convert(identifier);
	}
	@Override
	public Identifier toPhysicalTableName(Identifier identifier, JdbcEnvironment jdbcEnv) {
		return convert(identifier, "");
	}
	private Identifier convert(Identifier identifier, String prefix) {
		if (identifier == null || StringUtils.isEmpty(identifier.getText())) {
			return identifier;
		}
		return Identifier
				.toIdentifier(prefix + StringUtils.removeEndIgnoreCase(convert(identifier).getText(), "_ENTITY"));
	}

	private Identifier convert(Identifier identifier) {
		if (identifier == null || StringUtils.isEmpty(identifier.getText())) {
			return identifier;
		}
		String[] parts = StringUtils.splitByCharacterTypeCamelCase(identifier.getText());
		return Identifier.toIdentifier(StringUtils.join(parts, "_").toUpperCase());
	}
}
```

Edit

> src/main/resopurces/application.properties

```properties
...
spring.jpa.hibernate.naming.physical-strategy=com.codegreenllc.microservice.recipe.config.jpa.CustomPhysicalNamingStrategy
...
```

Add a base class to deal with common Entity attributes.

> src/main/java/com/codegreenllc/microservice/recipe/jpa/Auditable.java

```java
package com.codegreenllc.microservice.recipe.entity;

import static javax.persistence.TemporalType.TIMESTAMP;
import java.util.Date;
import java.util.UUID;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.Version;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import lombok.Data;

@Data
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
abstract class Auditable<U> {
	@CreatedBy
	U createdBy;
	@CreatedDate
	@Temporal(TIMESTAMP)
	Date createdDate;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;

	@LastModifiedBy
	U lastModifiedBy;

	@LastModifiedDate
	@Temporal(TIMESTAMP)
	Date lastModifiedDate;

	@Version
	private Long version;
}
```

> src/main/java/com/codegreenllc/microservice/recipe/config/jpa/AuditorAwareImpl.java

```java
package com.codegreenllc.microservice.recipe.entity;

import java.util.Optional;
import org.springframework.data.domain.AuditorAware;

class AuditorAwareImpl implements AuditorAware<String> {
	@Override
	public Optional<String> getCurrentAuditor() {
		// Get user from security context
		return Optional.of("System");
	}
}
```

> src/main/java/com/codegreenllc/microservice/recipe/config/jpa/JpaConfig.java

```java
package com.codegreenllc.microservice.recipe.config.jpa;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
class JpaConfig {
	@Bean(name = "auditorAware")
	public AuditorAware<String> auditorAware() {
		return new AuditorAwareImpl();
	}
}
```

src/main/java/com/codegreenllc/microservice/recipe/jpa/AuditorAwareImpl.java

```java
package com.codegreenllc.microservice.recipe.entity;

import java.util.Optional;
import org.springframework.data.domain.AuditorAware;

class AuditorAwareImpl implements AuditorAware<String> {

	@Override
	public Optional<String> getCurrentAuditor() {
		// Get user from security context
		return Optional.of("System");
	}
}
```

> src/main/java/com/codegreenllc/microservice/recipe/jpa/TodoEntity.java

```java
package com.codegreenllc.microservice.recipe.entity;

import javax.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Entity
public class TodoEntity extends Auditable<String> {
	private boolean completed;
	private String description;
}
```

> src/main/java/com/codegreenllc/microservice/recipe/repository/TodoRepository.java

```java
package com.codegreenllc.microservice.recipe.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.codegreenllc.microservice.recipe.entity.TodoEntity;

@Repository
public interface TodoRepository extends CrudRepository<TodoEntity, String> {}
```

> src/main/java/com/codegreenllc/microservice/recipe/service/TodoService.java

```java
package com.codegreenllc.microservice.recipe.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.codegreenllc.microservice.recipe.dto.TodoDto;
import com.codegreenllc.microservice.recipe.repository.TodoRepository;

@Transactional
@Service
public class TodoService {
	@Autowired
	TodoRepository todoRepository;

	public List<TodoDto> getAllTodos() {
		return StreamSupport.stream(todoRepository.findAll().spliterator(), false).map(g -> {
			// You should use a mapper like mapstruct here
			final TodoDto result = new TodoDto();
			result.setId(g.getId());
			result.setVersion(g.getVersion());
			result.setDescription(g.getDescription());
			result.setCompleted(g.isCompleted());
			return result;
		}).collect(Collectors.toList());
	}
}
```

Edit the Controller

> src/main/java/com/codegreenllc/microservice/recipe/controller/TodoController.java

```java
package com.codegreenllc.microservice.recipe.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.codegreenllc.microservice.recipe.dto.TodoDto;
import com.codegreenllc.microservice.recipe.service.TodoService;

@RestController
public class TodoController {
	@Autowired
	TodoService todoService;

	@RequestMapping("/v1/todo")
	public List<TodoDto> getAllTodos() {
		return todoService.getAllTodos();
	}
}

```

<div id="graphql"><h1>Add GraphQL</h1></div>

Add dependencies

> pom.xml

```xml
...
	<dependencies>
...
		<dependency>
			<groupId>com.graphql-java</groupId>
			<artifactId>graphql-spring-boot-starter</artifactId>
			<version>5.0.2</version>
		</dependency>
		<dependency>
			<groupId>com.graphql-java</groupId>
			<artifactId>graphql-java-tools</artifactId>
			<version>5.2.4</version>
		</dependency>
		<dependency>
			<groupId>com.graphql-java</groupId>
			<artifactId>graphiql-spring-boot-starter</artifactId>
			<version>4.3.0</version>
		</dependency>
...
	</dependencies>
...
```

> /src/main/resources/schema.graphqls

```json
schema {
  query: QueryType
}
type QueryType {
  allTodos: [Todo]
}
type Todo {
  id: String!
  version: Int!
  description: String!
  completed: Boolean!
}
```

> /src/main/java/com/codegreenllc/microservice/recipe/graphql/Query.java

```java
package com.codegreenllc.microservice.recipe.graphql;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.codegreenllc.microservice.recipe.dto.TodoDto;
import com.codegreenllc.microservice.recipe.service.TodoService;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;

@Component
public class Query implements GraphQLQueryResolver {
	@Autowired
	private TodoService todoService;
	public List<TodoDto> allTodos() {
		return todoService.getAllTodos();
	}
}
```

## Test it

Go to http://localhost:8080/graphiql with this Query.

```
{
  allTodos{
    id
    version
    description
    completed
  }
}
```

<div id="messaging"><h1>Add Messaging</h1></div>

Let's use Kafka cause it's the new hotness, but we can just as easily use ActiveMQ or some Cloud offering. For debugging, we should install the Kafka command-line tool. This install is not a requirement, but it gives visibility into the queue. I suggest using Homebrew to install.

<div id="kafka"><h2>Run Kafka with Docker</h2></div>

```console
brew install kafka
```

Let's use docker-compose to run Kafka.

> kafka/docker-compose.yml

```yaml
version: '3'
services:
  zookeeper:
    image: wurstmeister/zookeeper
  kafka:
    image: wurstmeister/kafka
    ports:
      - '9092:9092'
    environment:
      KAFKA_ADVERTISED_HOST_NAME: localhost
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
```

Start Kafka with this command.

```console
docker-compose up -d
docker ps
```

Start an interactive producer with this command.

```console
kafka-console-producer --broker-list localhost:9092 --topic test
```

Start a consumer to monitor the queue with this command.

```console
kafka-console-consumer --bootstrap-server localhost:9092 --topic test
```

<div id="producer-consumer"><h1>Producer and Consumer</h1></div>

Now for the code, let's create an object to hold the message and then create Producers and Consumers.

> src/main/java/com/codegreenllc/microservice/recipe/messaging/TodoMessage.java

```java
package com.codegreenllc.microservice.recipe.messaging;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoMessage {
	String description;
	UUID transactionId;
}
```

> src/main/java/com/codegreenllc/microservice/recipe/messaging/TodoProducer.java

```java
package com.codegreenllc.microservice.recipe.messaging;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TodoProducer {
	private static final String TOPIC = "todo";
	@Autowired
	private KafkaTemplate<String, String> kafkaTemplate;
	final ObjectMapper mapper = new ObjectMapper();

	public void sendMessage(final String todoDescription) throws JsonProcessingException {
		final String transactionId = UUID.randomUUID().toString();
		log.info("[{}: {}: {}] {}", "recipe", "TodoProducer.sendMessage", transactionId, todoDescription);
		final TodoMessage todoMessage = TodoMessage.builder().description(todoDescription)
				.transactionId(UUID.randomUUID()).build();
		kafkaTemplate.send(TOPIC, mapper.writeValueAsString(todoMessage));
	}
}
```

> src/main/java/com/codegreenllc/microservice/recipe/messaging/TodoConsumerjava

```java
package com.codegreenllc.microservice.recipe.messaging;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.codegreenllc.microservice.recipe.service.TodoService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TodoConsumer {
	final ObjectMapper mapper = new ObjectMapper();
	@Autowired
	TodoService todoService;

	@KafkaListener(topics = "todo", groupId = "group_id")
	public void consume(final String payload) throws JsonMappingException, JsonProcessingException {
		final TodoMessage todoMessage = mapper.readValue(payload, TodoMessage.class);
		log.info("[{}: {}: {}] {}", "recipe", "TodoConsumer.consume", todoMessage.transactionId,
				todoMessage.description);
		todoService.createFromDesctiption(todoMessage.description);
	}
}
```

Now wire it into our app.

> src/main/java/com/codegreenllc/microservice/recipe/service/TodoService.java

```java
package com.codegreenllc.microservice.recipe.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codegreenllc.microservice.recipe.dto.TodoDto;
import com.codegreenllc.microservice.recipe.entity.TodoEntity;
import com.codegreenllc.microservice.recipe.repository.TodoRepository;

@Transactional
@Service
public class TodoService {
	@Autowired
	TodoRepository todoRepository;

	public TodoDto createFromDesctiption(final String description) {
		final TodoEntity todoEntity = TodoEntity.builder().description(description).completed(false).build();
		final TodoEntity savedTodoEntity = todoRepository.save(todoEntity);
		return mapEntityToDto(savedTodoEntity);

	}

	public List<TodoDto> getAllTodos() {
		return StreamSupport.stream(todoRepository.findAll().spliterator(), false).map(g -> {
			// You should use a mapper like mapstruct here
			return mapEntityToDto(g);
		}).collect(Collectors.toList());
	}

	// You should use a mapper like mapstruct here
	private TodoDto mapEntityToDto(final TodoEntity entity) {
		final TodoDto result = TodoDto.builder() //
				.id(entity.getId()) //
				.version(entity.getVersion()) //
				.description(entity.getDescription()) //
				.completed(entity.isCompleted()).build();
		return result;
	}
}
```

> src/main/java/com/codegreenllc/microservice/recipe/service/TodoController.java

```java
package com.codegreenllc.microservice.recipe.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.codegreenllc.microservice.recipe.dto.TodoDto;
import com.codegreenllc.microservice.recipe.messaging.TodoProducer;
import com.codegreenllc.microservice.recipe.service.TodoService;
import com.fasterxml.jackson.core.JsonProcessingException;

@RestController
public class TodoController {
	@Autowired
	TodoProducer todoProducer;
	@Autowired
	TodoService todoService;

	@PostMapping("/v1/messaging/todo")
	public void createTodos(@RequestBody final String postPayload) throws JsonProcessingException {
		todoProducer.sendMessage(postPayload);
	}

	@GetMapping("/v1/todo")
	public List<TodoDto> getAllTodos() {
		return todoService.getAllTodos();
	}

}
```

## Test it

Use swagger http://localhost:8080/swagger-ui.html to POST a message into the queue. The consumer will read the message and insert a new todo in the database. Now Make a GET request to see the additional Todo.

<div id="monitoring"><h1>Monitoring</h1></div>
The best monitoring tool will depend on the environment and the client requirements. However I created this post that uses Spring Boot Acuator, Spring Boot Admin Server, and Eureka discovery service. [Metrics with Spring Boot](/post/2020-09-09-metrics-with-spring-boot/)

<div id="tracing"><h1>Tracing</h1></div>

I struggled with what to put here. I have a post on using [Prometheus with Grafana](/post/2019-09-09-grafana-and-prometheus-with-spring-boot/), so I could certainly include it here. The problem for me is that this tooling requires that I stand up, configure, and maintain a bunch of servers. Even then, the solution isn't what I would consider optimal.

Contrast this with the wide variety of logging and tracing tools offered as services. I'll pick [Datadog](https://www.datadoghq.com/) as an example, they support multiple languages, monitor server performance, and do log aggregation all at a very reasonable subscription price. There is so much competition in this space. I'm sure you can find a service that meets your needs and removes the cognitive load of dealing with monitoring in your architecture.

Enough about the tooling, whatever way you choose you **_MUST LOG MESSAGE CONTEXT_**. Failing to log message context necessarily render your aggregated log useless, and I've seen this in so many organizations. What does it take to do this correctly?
When an event enters your microservice network is must be assigned a globally unique identifier.
The identifier must be part of the messages passed between microservices. A microservice that transforms a message must respond with the same identifier that was received.
All aggregated logging must consistently include the identifier.
A unique identifier is the MINIMAL contextual information that is included in a message and requires consistent logging. Your organization will need to determine what additional fields are required to trace message processing within your microservice network.

<div id="configuration"><h1>Configuration Server</h1></div>

Since we are using microservices, I'll assume we need to launch many instances of a service. If this is not the case, you would need to question the need for the added complexity of building a microservice.

We need a way to distribute application properties to the instances of the microservice on startup. Springboot Configuration Server provides this functionality.

See [Setting up a Springboot Configuration Server](https://jameskolean.tech/post/2020-04-27-springboot-config-server-setup/)
