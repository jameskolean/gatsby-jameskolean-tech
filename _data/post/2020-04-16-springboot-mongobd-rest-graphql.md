---
template: BlogPost
date: 2020-04-16T15:43:12.724Z
title: SpringBoot + MongoBD + REST + GraphQL
thumbnail: /assets/space-walk-unsplash.jpg
tags:
  - Java
  - Spring Boot
source: https://gitlab.com/jameskolean/mongo-services/-/tree/master
---

I have a potential opportunity to use MongoDB on a project. I decided to build this simple application to see if anything changed since the last time I used Mongo DB.

You can find the source [here](https://gitlab.com/jameskolean/mongo-services/-/tree/master).

Start by going over to Spring Initializer at <https://start.spring.io/> and add these dependencies:

- **Lombok:**Java annotation library, which helps to reduce boilerplate code.
- **Spring Boot DevTools:**Provides fast application restarts, LiveReload, and configurations for enhanced development experience.
- **Spring Data MongoDB:**Store data in flexible, JSON-like documents, meaning fields can vary from document to document, and data structure can be changed over time.
- **Embedded MongoDB Database:**Provides a platform-neutral way for running MongoDB in unit tests.
- **Rest Repositories**

We need three Java classes to get this demo running; A controller to accept REST requests, an entity that defines the shape of the document in MongoDB, and a Repository that describes how we interact with MongoDB. Here are those files:

```java
package com.codegreenllc.mongoservices.controller;

import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codegreenllc.mongoservices.model.Department;
import com.codegreenllc.mongoservices.repos.DepartmentRepository;

@RestController
@RequestMapping("department")
public class DepartmentController {
	@Autowired
	private DepartmentRepository repository;

	private Sort buildSort(final String sort) {
		Sort by;
		if (Strings.isBlank(sort)) {
			by = Sort.by(Sort.Direction.ASC, "id");

		} else {
			by = Sort.by(Sort.Direction.ASC, sort);
		}
		return by;
	}

	@PostMapping()
	public Department create(@RequestBody final Department department) {
		repository.insert(department);
		return department;
	}

	@DeleteMapping("{id}")
	public String delete(@PathVariable("id") final String id) {
		repository.deleteById(id);
		return id;
	}

	@GetMapping()
	public Page<Department> getAll(@RequestParam final int page, @RequestParam final int size,
			@RequestParam(required = false) final String sort) {
		return repository.findAll(PageRequest.of(page, size, buildSort(sort)));
	}

	@GetMapping("{id}")
	public Department getById(@PathVariable("id") final String id) {
		return repository.findById(id).orElse(null);
	}

	@PatchMapping
	public Department update(@RequestBody final Department department) {
		if (!repository.existsById(department.id)) {
			return null;
		}
		return repository.save(department);
	}
}

```

```java
package com.codegreenllc.mongoservices.model;

import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Department {
	@Id
	public String id;
	String name;
}

```

```java
package com.codegreenllc.mongoservices.repos;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.codegreenllc.mongoservices.model.Department;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
	Department findByName(String name);
}
```

Now we need to do some configuration so open **/src/main/resources/application.properties** and add these properties. These properties will work with a locally installed community version of MongoDB.

```properties
spring.data.mongodb.authentication-database=admin
spring.data.mongodb.database=test
spring.data.mongodb.port=27017
spring.data.mongodb.host=localhost

```

## Start it up

```shell
mvn spring-boot:run
```

## Testing

We have some choices here, and I have includes an export from Insomnia in the folder by that name. Insomnia is a great tool, and I encourage you to install it.

There is another option, we can embed a tester in our application. Add the dependency to pom.xml

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.2.32</version>
</dependency>

```

Restart the application and open a browser tab to [](http://localhost:8080/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#/l)<http://localhost:8080/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#>

## GraphQL

That's cool, but maybe we can add GraphQL alongside the REST API.

Let's start with some new dependencies in **pom.xml**.

```xml
<!-- GraphQL stuff start -->
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
<!-- GraphQL stuff end -->
```

GraphQL is based on schemas so let's create one in the file /src/main/java/resources/schema.graphqls

```json
schema {
    query: QueryType
    mutation: MutationType
}
type QueryType {
    allDepartments(page: Int = 0, size: Int = 10 , sort: DepartmentSortField!): [Department]
    department(id: String!): Department
}
type Department {
    id: String
    name: String
}
enum DepartmentSortField {
	id
	name
}
type MutationType {
    createDepartment(name: String!): Department
    deleteDepartment(id: String!): String
    updateDepartment(id: String!, name: String!): Department
}
```

Then we need to add classes to process the Queries and Mutation.

```java
package com.codegreenllc.mongoservices.graphql.resolvers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import com.codegreenllc.mongoservices.model.Department;
import com.codegreenllc.mongoservices.repos.DepartmentRepository;
import com.coxautodev.graphql.tools.GraphQLQueryResolver;

@Component
public class Query implements GraphQLQueryResolver {
	@Autowired
	private DepartmentRepository departmentRepository;

	public List<Department> allDepartments(final int page, final int size, final DepartmentSortFieldEnum sort) {
		return departmentRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, sort.name())))
				.getContent();
	}
	public Department department(final String id) {
		return departmentRepository.findById(id).orElse(null);
	}
}
```

```java
package com.codegreenllc.mongoservices.graphql.resolvers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.codegreenllc.mongoservices.model.Department;
import com.codegreenllc.mongoservices.repos.DepartmentRepository;
import com.coxautodev.graphql.tools.GraphQLMutationResolver;

@Component
public class Mutation implements GraphQLMutationResolver {
	@Autowired
	private DepartmentRepository departmentRepository;
	public Department createDepartment(final String name) {
		final Department department = new Department();
		department.setName(name);
		return departmentRepository.insert(department);
	}
	public String deleteDepartment(final String id) {
		departmentRepository.deleteById(id);
		return id;
	}
	public Department updateDepartment(final String id, final String name) {
		final Department department = new Department();
		department.setId(id);
		department.setName(name);
		return departmentRepository.save(department);
	}
}
```

```java
package com.codegreenllc.mongoservices.graphql.resolvers;

public enum DepartmentSortFieldEnum {
	id, name;
}
```

Test it out by opening a browser to <http://localhost:8080/graphiql>.

Here are some example Queries and Mutations you can use in GraphiQL

```json
mutation create {
  createDepartment(name: "tester") {
    id
    name
  }
}
mutation update {
  updateDepartment(id: "5e9879d9a7e5c63fab45b24c",name:"hello"){
    id
    name
  }
}
mutation delete {
  deleteDepartment(id: "5e987986a7e5c63fab45b24b")
}
query all {
  allDepartments(page: 0, size: 10, sort: name) {
    id
    name
  }
}
```
