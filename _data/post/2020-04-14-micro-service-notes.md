---
template: BlogPost
date: 2019-09-04T15:09:43.336Z
title: Micro-service notes
thumbnail: /assets/sticky-note-square-unsplash.jpg
tags:
  - Java
  - Spring Boot
  - Microservice
source: https://gitlab.com/jameskolean/spring-cloud-demo/tree/master
---

These are my note on setting up Micro-Services with Spring Cloud. I went thru many tutorials that had broken dependencies. I put this together so I have a working stack I can reference. In the blog we will build servers for Configuration, Discovery, Gateway, and two REST APIS.

**TLDR**

If you just want to see Zipkin working, get the [source code](https://gitlab.com/jameskolean/spring-cloud-demo/tree/master) and run these commands to start the servers and generate traces. You can then see them at <http://localhost:9411/zipkin/>

Note: you first need to copy the directory application-config to \${user.home}/application-config and git initialize it. These provide the configuration settings that the Configuration Server will distribute.

```shell
mvn spring-boot:run -pl config-service
mvn spring-boot:run -pl discovery
mvn spring-boot:run -pl book-service
mvn spring-boot:run -pl rating-service
mvn spring-boot:run -pl gateway
docker run -d -p 9411:9411 openzipkin/zipkin
curl http://localhost:7080/booking-service/books
curl http://localhost:7080/rating-service/ratings
```

These notes are based on the tutorial at <https://www.baeldung.com/spring-cloud-bootstrapping>.

## _Let’s get started setting up the Servers!_

## Configuration Server

This will be a central store of application parameters for the micro-services we build later will pull from.

Create a Springboot App from[ spring initializer](https://start.spring.io/) and include the ‘config server’ dependency.

Enable Server config in our Application Configuration.

```java
SpringBootApplication
@EnableConfigServer
public class ConfigApplication {...}
```

Add to application.properties

```properties
server.port=7281
spring.application.name=config
spring.cloud.config.server.git.uri=file://${user.home}/application-config
```

Create the directory \${user.home}/application-config and git initialize it.

```shell
mkdir ~/aplication-config
cd ~/application-config
git init
```

### Test

Let’s see if it runs

```shell
mvn spring-boot:run -pl config-service
```

## Discovery Server

This server enables servers to locate each other without hard coding IP addresses and ports.

Create a Springboot App from[ spring initializer](https://start.spring.io/) and include the ‘config client’ and ‘eurekaserver’ dependencies.

Enable Server config in our Application Configuration.

```java
SpringBootApplication
@EnableEurekaServer
public class DiscoveryApplication {...}
```

Create the file bootstrap.properties in the resources directory.

```properties
spring.cloud.config.name=discovery
spring.cloud.config.uri=http://localhost:7081
```

Create a file discovery.properties in the Git repository we created. This will be used to configure the discovery service.

```properties
spring.application.name=discovery
server.port=7082

eureka.instance.hostname=localhost

eureka.client.serviceUrl.defaultZone=http://localhost:7082/eureka/
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

## Tell the Configure Server about the Discovery server

Go back to the Configuration Server and add the dependency.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-eureka</artifactId>
    <version>1.4.7.RELEASE</version>
</dependency>
```

### Test

You can now run the Configuration and Discovery servers and you should see them interacting in the logs.

```shell
mvn spring-boot:run -pl config-service
mvn spring-boot:run -pl discovery
```

Discovery Server log

```shell
Fetching config from server at: http://localhost:7081
```

Configuration Server log

```shell
DiscoveryClient_CONFIG/10.1.10.235:config:8081: registering service...
Tomcat started on port(s): 7081 (http)
DiscoveryClient_CONFIG/10.1.10.235:config:7081 - registration status: 204
```

## Gateway

This server provides a reverse proxy to the services we will be building. This eliminates the need for CORS and give us a convenient place to handle common problems like authentication.

Create a Springboot App from[ spring initializer](https://start.spring.io/) and include the ‘zuul’, ‘config client’ and ‘eureka discovery’ dependencies.

Enable Server config in our Application Configuration.

```java
@SpringBootApplication
@EnableZuulProxy
@EnableEurekaClient
public class GatewayApplication {...}
```

Add these parameters to application.properties

```properties
spring.cloud.config.name=gateway
spring.cloud.config.discovery.service-id=config
spring.cloud.config.discovery.enabled=true

eureka.client.serviceUrl.defaultZone=http://localhost:7082/eureka/
```

Create a file discovery.properties in the Git repository we created.

```properties
spring.application.name=gateway
server.port=7080

eureka.client.region = default
eureka.client.registryFetchIntervalSeconds = 5

zuul.routes.book-service.path=/book-service/**
zuul.routes.book-service.sensitive-headers=Set-Cookie,Authorization
hystrix.command.book-service.execution.isolation.thread.timeoutInMilliseconds=600000

zuul.routes.rating-service.path=/rating-service/**
zuul.routes.rating-service.sensitive-headers=Set-Cookie,Authorization
hystrix.command.rating-service.execution.isolation.thread.timeoutInMilliseconds=600000

zuul.routes.discovery.path=/discovery/**
zuul.routes.discovery.sensitive-headers=Set-Cookie,Authorization
zuul.routes.discovery.url=http://localhost:7082
hystrix.command.discovery.execution.isolation.thread.timeoutInMilliseconds=600000
```

### Test

Start the Gateway server

```shell
mvn spring-boot:run -pl gateway
```

Logs

```powershell
Fetching config from server at : http://james-mbp:7081/
...
DiscoveryClient_GATEWAY/james-mbp:gateway:7080: registering service...
DiscoveryClient_GATEWAY/james-mbp:gateway:7080 - registration status: 204
Tomcat started on port(s): 7080 (http) with context path ''
```

## Create some Services (Book and Rating Service)

Now let’s create two Springboot Apps from [spring initializer](https://start.spring.io/) and include ‘web’, config client’ and ‘eureka discovery’ dependencies. Let’s add ‘Lombok’ and ‘DevTools’ too. Call one book-service and the other rating-service

### Rating Service

Create a POJO for the rating

```java
@Data
@Builder
public class Rating {
    private Long id;
    private Long bookId;
    private int stars;
}
```

For the example we will cram all the code into the application configuration class, clearly we would not do this in a large application.

```java
@SpringBootApplication
@EnableEurekaClient
@RestController
@RequestMapping("/ratings")
public class RatingServiceApplication {
    public static void main(final String[] args) {
        SpringApplication.run(RatingServiceApplication.class, args);
    }

    private final List<Rating> ratingList = Arrays.asList(Rating.builder().id(1L).bookId(1L).stars(5).build(),
            Rating.builder().id(2L).bookId(2L).stars(4).build(), Rating.builder().id(3L).bookId(3L).stars(3).build(),
            Rating.builder().id(4L).bookId(4L).stars(2).build(), Rating.builder().id(5L).bookId(5L).stars(1).build());

    @GetMapping("/all")
    public List<Rating> findAllRatings() {
        return ratingList;
    }

    @GetMapping("")
    public List<Rating> findRatingsByBookId(@RequestParam final Long bookId) {
        return bookId == null || bookId.equals(0L) ? Collections.EMPTY_LIST
                : ratingList.stream().filter(r -> r.getBookId().equals(bookId)).collect(Collectors.toList());
    }
}
```

Add our bootstrap.properties

```properties
spring.cloud.config.name=rating-service
spring.cloud.config.discovery.service-id=config
spring.cloud.config.discovery.enabled=true

eureka.client.serviceUrl.defaultZone=http://localhost:7082/eureka/
```

Now create a file rating-service.properties in the Git repository.

```properties
spring.application.name=rating-service
server.port=7084

eureka.client.region = default
eureka.client.registryFetchIntervalSeconds = 5
eureka.client.serviceUrl.defaultZone=http://localhost:7082/eureka/
```

### Book Service

Create a POJO for the book.

```java
@Data
@Builder
public class Book {
    private String author;
    private Long id;
    private String title;
}
```

For the example we will cram all the code into the application configuration class, clearly we would not do this in a large application.

```java
@SpringBootApplication
@EnableEurekaClient
@RestController
@RequestMapping("/books")
public class BookServiceApplication {
    public static void main(final String[] args) {
        SpringApplication.run(BookServiceApplication.class, args);
    }

    private final List<Book> bookList = Arrays.asList(
            Book.builder().id(1L).title("Watchmen").author("Alan Moore").build(),
            Book.builder().id(2L).title("The Color of Magic").author("Terry Pratchett").build());

    @GetMapping("")
    public List<Book> findAllBooks() {
        return bookList;
    }

    @GetMapping("/{bookId}")
    public Book findBook(@PathVariable final Long bookId) {
        return bookList.stream().filter(b -> b.getId().equals(bookId)).findFirst().orElse(null);
    }
}
```

### Test

Start all the services in order and make sure the Configuration server is running before starting the others.

```shell
mvn spring-boot:run -pl config-service
mvn spring-boot:run -pl discovery
mvn spring-boot:run -pl book-service
mvn spring-boot:run -pl rating-service
mvn spring-boot:run -pl gateway
```

Go to the Book Service and Rating Service directly to make sure they are running.

```shell
curl http://localhost:7085/books
curl http://localhost:7084/ratings
```

Now check the gateway

```shell
curl http://localhost:7080/booking-service/books
curl http://localhost:7080/rating-service/ratings
```

## Opentracing with Zipkin

Create a Springboot App from[ spring initializer](https://start.spring.io/) called zipkin. This will be the server that collects and displays distributed tracing providing visibility as messages across micro-service boundaries.

Add these dependencies to book-service, rating-service, and gateway.

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-core</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>
```

Edit the property file in the Git directory for book-service, rating-service, and gateway.

```properties
logging.level.org.springframework.web.servlet.DispatcherServlet=DEBUG
spring.zipkin.sender.type=web
spring.zipkin.baseUrl=http://localhost:9411
spring.sleuth.sampler.probability=1.0
```

### Test

Start the Zipkin server as a docker container.

```shell
docker run -d -p 9411:9411 openzipkin/zipkin
```

Open a browser to[ http://localhost:9411/zipkin/](http://localhost:9411/zipkin/)

Now just restart the gateway, book-service, and rating-service and test the endpoint to generate traces in Zipkin

```shell
curl http://localhost:7080/booking-service/books
curl http://localhost:7080/rating-service/ratings
```
