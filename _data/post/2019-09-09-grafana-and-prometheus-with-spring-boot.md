---
template: BlogPost
date: 2019-09-09T15:02:01.973Z
title: Grafana and Prometheus with Spring Boot
thumbnail: /assets/fire-unsplash.jpg
tags:
  - Java
  - Spring Boot
  - Microservice
  - Docker
source: https://gitlab.com/jameskolean/dashboard-demo/tree/master
published: true
---

I’m not sure how I feel about this combination. I had high hopes but it’s been frustrating to get working. I guess if I had the time it would be useful to create a slick dashboard and alerts against Spring Actuator parameters.

Let’s get started building a working example. The source code is [here](https://gitlab.com/jameskolean/dashboard-demo/tree/master).

Go to[ Spring Initializer](https://start.spring.io/) and create an app called dashboard-demo including these dependencies: Spring Web, Spring Boot Actuator, Lombok, and Spring Boot Dev Tools.

Replace the DashboardDemoApplication class with MovieServiceApplication. This is a simple web application we can play with.

```java
@SpringBootApplication
@RestController
@RequestMapping("/movies")
public class MovieServiceApplication {

    public static void main(final String[] args) {
        SpringApplication.run(MovieServiceApplication.class, args);
    }

    private final List<Movie> movieList = Arrays.asList(
            Movie.builder().id(1L).title("Watchmen").director("Zack Snyder").build(),
            Movie.builder().id(2L).title("The Color of Magic").director("Vadim Jean").build());

    @GetMapping("")
    public List<Movie> findAllBooks() {
        return movieList;
    }

    @GetMapping("/{movieId}")
    public Movie findBook(@PathVariable final Long movieId) {
        return movieList.stream().filter(b -> b.getId().equals(movieId)).findFirst().orElse(null);
    }

}
```

An create a Movie class

```java
@Data
@Builder
public class Movie {
    private String director;
    private Long id;
    private String title;
}
```

Now edit src/main/resources/application.properties to enable the actuator endpoints.

```properties
#Metrics related configurations
management.endpoint.metrics.enabled=true
management.endpoints.web.exposure.include=*
management.endpoint.prometheus.enabled=true
management.metrics.export.prometheus.enabled=true
```

Now we just need to include the Prometheus dependencies that will expose the actuator values to the Prometheus server. Add these dependencies to build.gradle.

```groovy
// Micormeter core dependecy
implementation 'io.micrometer:micrometer-core'
// Micrometer Prometheus registry  -->
implementation 'io.micrometer:micrometer-registry-prometheus'
```

### Test it

Run the application

```bash
gradlew bootRun
```

Open a browser to <http://localhost:8080/actuator> and you should see this

```json
{"_links":{"self":
...
"prometheus":{"href":"http://localhost:8080/actuator/prometheus","templated":false},
...
}}
```

## Running Prometheus and Grafana

We will run these with docker compose. create a docker-compose.yml file.

```dockerfile
version: '2'
services:
  prometheus:
    image: prom/prometheus:0.18.0
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '-config.file=/etc/prometheus/prometheus.yml'
    ports:
      - '9090:9090'
  grafana:
    image: grafana/grafana
    ports:
      - 3000:3000
```

We need to provide the configuration to prometheus so create prometheus.yml like this.

```yaml
global:
  scrape_interval: 5s
  external_labels:
    monitor: 'my-monitor'
scrape_configs:
  - job_name: 'prometheus'
    target_groups:
      - targets: ['localhost:9090']
  - job_name: 'movie-service'
    metrics_path: '/actuator/prometheus'
    target_groups:
      - targets: ['host.docker.internal:8080']
```

Now launch them

```bash
docker-compose up
```

Open a browser to[ http://localhost:9090/graph](http://localhost:9090/graph) for prometheus. Go to Status > Targets to make sure the Movie-Service is being monitored.

Now open a browser to <http://localhost:3000/login>. The default credentials are admin:admin. Once in you will want to add Prometheus as a data source. Set the URL to [http://localhost:9090](http://localhost:9090/) and the Access to ‘Browser’. On the Dashboards tab you can import some prebuilt Prometheus dashboards to get started.
