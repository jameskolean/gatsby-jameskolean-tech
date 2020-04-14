---
template: BlogPost
date: 2019-11-06T14:55:52.705Z
title: SpringBoot and Kafka Streams and Bindings
thumbnail: /assets/cloud-sunray-unsplash.jpg
---
This is a follow up to my previous post. After watching the YouTube video [Spring Tips: Spring Cloud Stream Kafka Streams](https://www.youtube.com/watch?v=YPDzcmqwCNo) it’s clear I was missing the power of Kafka. Following the tutorial I ran into issues performing the count. The error points to an issue serializing the materialized view and Spring Boot seems to ignore the application properties. This post will just add the code that 1) generates events 2) transforms events and 3) consumes the transformed event. The sources can be found at [GitLab in the ‘Streams’ branch](https://gitlab.com/jameskolean/springboot-kafka/tree/Streams).

## Generate Rate Events

We can start with the POM file (pom.xml).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
...
	<properties>
		<java.version>1.8</java.version>
		<spring-cloud.version>Hoxton.RC1</spring-cloud.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.apache.kafka</groupId>
			<artifactId>kafka-streams</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-stream</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-stream-binder-kafka</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-stream-binder-kafka-streams</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.kafka</groupId>
			<artifactId>spring-kafka</artifactId>
		</dependency>
...
	</dependencies>
	
...
	<repositories>
		<repository>
			<id>spring-milestones</id>
			<name>Spring Milestones</name>
			<url>https://repo.spring.io/milestone</url>
		</repository>
	</repositories>
</project>
```

Now we can create an Event.

```java
package com.codegreenllc.kafka.events;
 
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RateEvent {
    protected String item;
    protected int rating;
}
```

Now define the Binding interface.

```java
package com.codegreenllc.kafka;
 
import org.apache.kafka.streams.kstream.KStream;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.cloud.stream.annotation.Output;
import org.springframework.messaging.MessageChannel;
 
import com.codegreenllc.kafka.events.RateEvent;
 
public interface RatingsBinding {
    String RATE_EVENTS_TOPIC = "rateevents";
    String TOP_RATING_TOPIC = "topratings";
 
    @Input(RATE_EVENTS_TOPIC)
    KStream<String, RateEvent> rateEventIn();
 
    @Output(RATE_EVENTS_TOPIC)
    MessageChannel rateEventOut();
 
    @Output(TOP_RATING_TOPIC)
    KStream<String, RateEvent> topRateCountOut();
}
```

Finally create the Source for the rating events.

```java
package com.codegreenllc.kafka;
 
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
 
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
 
import com.codegreenllc.kafka.events.RateEvent;
 
import lombok.extern.slf4j.Slf4j;
 
@Component
@Slf4j
public class RatingEventSource implements ApplicationRunner {
 
    MessageChannel rateEventOut;
 
    public RatingEventSource(final RatingsBinding binding) {
        rateEventOut = binding.rateEventOut();
    }
 
    @Override
    public void run(final ApplicationArguments args) throws Exception {
        final List<String> fruits = Arrays.asList("apple", "orange", "pumpkin", "strawberry", "peach", "mango");
        final Runnable runnable = () -> {
            final String fruit = fruits.get(new Random().nextInt(fruits.size()));
            final int rating = new Random().nextInt(6);
            final RateEvent rateEvent = RateEvent.builder().item(fruit).rating(rating).build();
            final Message<RateEvent> message = MessageBuilder.withPayload(rateEvent)
                    .setHeader(KafkaHeaders.MESSAGE_KEY, UUID.randomUUID().toString().getBytes()).build();
            try {
                rateEventOut.send(message);
                log.info(">>>Generted event {}", rateEvent);
            } catch (final Exception e) {
                log.error("Error sending Rate Event.", e);
            }
        };
        Executors.newScheduledThreadPool(1).scheduleAtFixedRate(runnable, 1, 1, TimeUnit.SECONDS);
    }
}
```

Add a processor that filters and transforms Rating Events adding them to a new topic.

```java
package com.codegreenllc.kafka;
 
import org.apache.kafka.streams.KeyValue;
import org.apache.kafka.streams.kstream.KStream;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Component;
 
import com.codegreenllc.kafka.events.RateEvent;
 
@Component
public class RatingEventProcessor {
 
    @StreamListener()
    @SendTo(RatingsBinding.TOP_RATING_TOPIC)
    public KStream<String, RateEvent> process(
            @Input(RatingsBinding.RATE_EVENTS_TOPIC) final KStream<String, RateEvent> stream) {
 
        return stream
                // only look at top ratings
                .filter((key, rateEvent) -> rateEvent.getRating() >= 5)
                // map to event with key = item name so we can group them
                .map((key, value) -> new KeyValue<>(key, uppercase(value)));
    }
 
    private RateEvent uppercase(final RateEvent value) {
        return new RateEvent(value.getItem().toUpperCase(), value.getRating());
    }
}
```

Finally add the consumer of the transformed events.

```java
package com.codegreenllc.kafka;
 
import org.apache.kafka.streams.kstream.KStream;
import org.springframework.cloud.stream.annotation.Input;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.stereotype.Component;
 
import com.codegreenllc.kafka.events.RateEvent;
 
import lombok.extern.slf4j.Slf4j;
 
@Slf4j
@Component
public class TopRatingSink {
 
    @StreamListener()
    public void sink(@Input(RatingsBinding.TOP_RATING_TOPIC) final KStream<String, RateEvent> stream) {
        stream.foreach((key, value) -> log.info("<<<Top ratings Topic: {}", value.toString()));
    }
}
```

To test, start Kafka with docker-compose and monitor the event. then run the Spring Boot app.

```shell
docker-compose up -d
kafka-console-consumer --bootstrap-server localhost:9092 --topic rateevents
kafka-console-consumer --bootstrap-server localhost:9092 --topic topratings
```
